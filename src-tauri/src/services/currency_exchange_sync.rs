use crate::services::balance_sheet::BalanceSheetService;
use crate::services::currency_rate::CurrencyRateService;
use crate::services::user_settings::UserSettingsService;
use crate::{models::CurrencyRate, services::account::AccountService};
use chrono::{Datelike, NaiveDate};
use reqwest::Client;
use serde::Deserialize;
use sqlx::SqlitePool;
use std::collections::{HashMap, HashSet};

#[derive(Deserialize, Debug)]
struct FrankfurterResponse {
    rates: HashMap<String, HashMap<String, f64>>,
}

pub struct SyncService;

impl SyncService {
    pub async fn sync_exchange_rates(pool: &SqlitePool) -> Result<(), String> {
        println!("[Sync] Starting exchange rate sync...");

        // 1. Get Home Currency
        let settings_list = UserSettingsService::get_all(pool).await?;
        let settings = settings_list.first().ok_or("User settings not found")?;
        let home_currency = &settings.home_currency;

        // 2. Get Foreign Currencies from Accounts
        let accounts = AccountService::get_all(pool, true).await?;
        let foreign_currencies: Vec<String> = accounts
            .into_iter()
            .map(|a| a.currency)
            .filter(|c| c != home_currency)
            .collect::<HashSet<_>>() // Dedup
            .into_iter()
            .collect();

        if foreign_currencies.is_empty() {
            println!("[Sync] No foreign currencies found. Sync skipped.");
            return Ok(());
        }

        // 3. Get Years from Balance Sheets
        let sheets = BalanceSheetService::get_all(pool).await?;
        let years: Vec<i32> = sheets.into_iter().map(|s| s.year).collect();

        if years.is_empty() {
            println!("[Sync] No balance sheets found. Sync skipped.");
            return Ok(());
        }

        // 4. Existing Rates for Dedup and Finalization Check
        let all_rates = CurrencyRateService::get_all(pool).await?;
        let mut rate_map: HashMap<String, CurrencyRate> = HashMap::new();
        for r in all_rates {
            let key = format!(
                "{}-{}-{}-{}",
                r.year, r.month, r.from_currency, r.to_currency
            );
            rate_map.insert(key, r);
        }

        let client = Client::new();
        let today = chrono::Utc::now().naive_utc().date();

        println!("[Sync] Syncing rates for years: {years:?} with base currency: {home_currency}",);

        for year in years {
            // Find earliest incomplete month for this year
            let (earliest_month, any_incomplete) = Self::find_earliest_incomplete_month(
                year,
                today,
                &foreign_currencies,
                home_currency,
                &rate_map,
            );

            if !any_incomplete && year < today.year() {
                println!("[Sync] Year {year} already finalized. Skipping.");
                continue;
            }

            let symbols = foreign_currencies.join(",");
            let start_date = format!("{year}-{earliest_month:02}-01");
            // Frankfurter handles end dates in future by clamping to latest available
            let end_date = format!("{year}-12-31");

            let optimized_url = crate::constants::FRANKFURTER_BASE_URL
                .replacen("{}", &start_date, 1)
                .replacen("{}", &end_date, 1)
                .replacen("{}", home_currency, 1)
                .replacen("{}", &symbols, 1);

            println!(
                "[Sync] Fetching rates for year {year} starting from month {earliest_month}...",
            );

            let resp = match client.get(&optimized_url).send().await {
                Ok(r) => r,
                Err(e) => {
                    eprintln!("[Sync] Request error for {year}: {e}");
                    continue;
                }
            };

            if !resp.status().is_success() {
                eprintln!(
                    "[Sync] Frankfurter API warning for {year}: Status {}",
                    resp.status()
                );
                continue;
            }

            match resp.json::<FrankfurterResponse>().await {
                Ok(data) => {
                    let _ = Self::process_and_save_rates(
                        pool,
                        data.rates,
                        year,
                        home_currency,
                        &rate_map,
                    )
                    .await;
                }
                Err(e) => eprintln!("[Sync] Failed to parse JSON for {year}: {e}"),
            }
        }

        println!("[Sync] Exchange rate sync complete.");
        Ok(())
    }

    async fn process_and_save_rates(
        pool: &SqlitePool,
        rates: HashMap<String, HashMap<String, f64>>,
        year: i32,
        home_currency: &str,
        rate_map: &HashMap<String, CurrencyRate>,
    ) -> Result<(), String> {
        // Process rates
        let monthly_rates = Self::process_frankfurter_rates(rates, year);
        let total_to_process = monthly_rates.values().map(|m| m.len()).sum::<usize>();
        println!("[Sync] Processing {total_to_process} rates for year {year}...",);

        let mut success_count = 0;
        let mut fail_count = 0;

        // Upsert
        for (month, rates_obj) in monthly_rates {
            // Finalization check
            let last_day = if month == crate::constants::DECEMBER {
                NaiveDate::from_ymd_opt(year + 1, 1, 1)
                    .unwrap()
                    .pred_opt()
                    .unwrap()
            } else {
                NaiveDate::from_ymd_opt(year, month + 1, 1)
                    .unwrap()
                    .pred_opt()
                    .unwrap()
            };

            for (foreign, rate_in_home) in rates_obj {
                let key = format!("{year}-{month}-{foreign}-{home_currency}");

                // Skip if already finalized
                if rate_map.contains_key(&key)
                    && rate_map.get(&key).unwrap().timestamp.naive_utc().date() > last_day
                {
                    continue;
                }

                let inverted_rate = 1.0 / rate_in_home;
                let existing_id = rate_map.get(&key).map(|r| r.id.clone());

                println!(
                    "Processing rate for {month}/{year} ({foreign}->{home_currency}): {rate_in_home}->{inverted_rate}",
                );

                match CurrencyRateService::upsert(
                    pool,
                    existing_id,
                    foreign.clone(),
                    home_currency.to_string(),
                    inverted_rate,
                    month,
                    year,
                )
                .await
                {
                    Ok(_) => success_count += 1,
                    Err(e) => {
                        fail_count += 1;
                        eprintln!(
                            "[Sync] Failed to upsert rate for {year}-{month}-{foreign}-{home_currency}: {e}",
                        );
                    }
                }
            }
        }
        println!(
            "[Sync] Year {year} complete: {success_count} updated/inserted, {fail_count} failed."
        );
        Ok(())
    }

    fn find_earliest_incomplete_month(
        year: i32,
        today: NaiveDate,
        foreign_currencies: &[String],
        home_currency: &str,
        rate_map: &HashMap<String, CurrencyRate>,
    ) -> (u32, bool) {
        let mut earliest_month = 1;
        let mut any_incomplete = false;

        for month in 1..=crate::constants::MONTHS_PER_YEAR {
            // If the month is in the future, we can't sync it (except current month)
            if year > today.year() || (year == today.year() && month > today.month()) {
                break;
            }

            // Check if all foreign currencies for this month are finalized
            let mut all_finalized = true;
            for foreign in foreign_currencies {
                let key = format!("{year}-{month}-{foreign}-{home_currency}");
                if let Some(rate) = rate_map.get(&key) {
                    // Finalized = updated after the month ended
                    let last_day = if month == crate::constants::DECEMBER {
                        NaiveDate::from_ymd_opt(year + 1, 1, 1)
                            .unwrap()
                            .pred_opt()
                            .unwrap()
                    } else {
                        NaiveDate::from_ymd_opt(year, month + 1, 1)
                            .unwrap()
                            .pred_opt()
                            .unwrap()
                    };

                    if rate.timestamp.naive_utc().date() <= last_day {
                        all_finalized = false;
                        break;
                    }
                } else {
                    all_finalized = false;
                    break;
                }
            }

            if !all_finalized {
                earliest_month = month;
                any_incomplete = true;
                break;
            }
        }

        (earliest_month, any_incomplete)
    }

    fn process_frankfurter_rates(
        rates: HashMap<String, HashMap<String, f64>>,
        target_year: i32,
    ) -> HashMap<u32, HashMap<String, f64>> {
        let mut monthly_max_dates: HashMap<u32, NaiveDate> = HashMap::new();
        let mut monthly_rates: HashMap<u32, HashMap<String, f64>> = HashMap::new();

        for (date_str, rates_obj) in rates {
            if let Ok(date) =
                NaiveDate::parse_from_str(&date_str, crate::constants::FRANKFURTER_DATE_FORMAT)
            {
                if date.year() != target_year {
                    continue;
                }
                let month = date.month();

                let is_later = match monthly_max_dates.get(&month) {
                    Some(prev_date) => date > *prev_date,
                    None => true,
                };

                if is_later {
                    monthly_max_dates.insert(month, date);
                    monthly_rates.insert(month, rates_obj);
                }
            }
        }
        monthly_rates
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_frankfurter_rates() {
        let mut rates = HashMap::new();

        // Month 1, earlier date
        let mut m1_d1 = HashMap::new();
        m1_d1.insert("EUR".to_string(), 0.8);
        rates.insert("2024-01-01".to_string(), m1_d1);

        // Month 1, later date
        let mut m1_d2 = HashMap::new();
        m1_d2.insert("EUR".to_string(), 0.9);
        rates.insert("2024-01-15".to_string(), m1_d2);

        // Month 2, single date
        let mut m2_d1 = HashMap::new();
        m2_d1.insert("EUR".to_string(), 1.1);
        rates.insert("2024-02-05".to_string(), m2_d1);

        // Outside year
        let mut m12_d31 = HashMap::new();
        m12_d31.insert("EUR".to_string(), 0.75);
        rates.insert("2023-12-31".to_string(), m12_d31);

        let processed = SyncService::process_frankfurter_rates(rates, 2024);

        assert_eq!(processed.len(), 2);
        assert_eq!(processed.get(&1).unwrap().get("EUR").unwrap(), &0.9);
        assert_eq!(processed.get(&2).unwrap().get("EUR").unwrap(), &1.1);
    }
}
