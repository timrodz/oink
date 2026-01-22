use chrono::{Duration, Local, NaiveDate};
use serde::{Deserialize, Serialize};

pub const RETURN_SCENARIO_CONSERVATIVE: &str = "conservative";
pub const RETURN_SCENARIO_MODERATE: &str = "moderate";
pub const RETURN_SCENARIO_AGGRESSIVE: &str = "aggressive";

pub const RETURN_RATE_CONSERVATIVE: f64 = 0.04;
pub const RETURN_RATE_MODERATE: f64 = 0.07;
pub const RETURN_RATE_AGGRESSIVE: f64 = 0.10;

pub const WITHDRAWAL_RATE_LOW: f64 = 0.03;
pub const WITHDRAWAL_RATE_HIGH: f64 = 0.04;

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RetirementProjection {
    pub projected_retirement_date: Option<NaiveDate>,
    pub years_to_retirement: f64,
    pub final_net_worth: f64,
    pub monthly_income_3pct: f64,
    pub monthly_income_4pct: f64,
}

pub struct RetirementService;

impl RetirementService {
    pub fn annual_return_rate(scenario: &str) -> Result<f64, String> {
        match scenario {
            RETURN_SCENARIO_CONSERVATIVE => Ok(RETURN_RATE_CONSERVATIVE),
            RETURN_SCENARIO_MODERATE => Ok(RETURN_RATE_MODERATE),
            RETURN_SCENARIO_AGGRESSIVE => Ok(RETURN_RATE_AGGRESSIVE),
            _ => Err(format!("Unknown return scenario: {scenario}")),
        }
    }

    pub fn compound_growth_future_value(
        starting_net_worth: f64,
        monthly_contribution: f64,
        annual_return_rate: f64,
        years: f64,
    ) -> f64 {
        if years <= 0.0 {
            return starting_net_worth;
        }

        let annual_contribution = monthly_contribution * 12.0;

        if annual_return_rate.abs() < f64::EPSILON {
            return starting_net_worth + annual_contribution * years;
        }

        let growth_factor = (1.0 + annual_return_rate).powf(years);
        starting_net_worth * growth_factor
            + annual_contribution * ((growth_factor - 1.0) / annual_return_rate)
    }

    pub fn monthly_income_from_withdrawal(net_worth: f64, withdrawal_rate: f64) -> f64 {
        net_worth * withdrawal_rate / 12.0
    }

    pub fn target_net_worth(expected_monthly_expenses: f64, withdrawal_rate: f64) -> Option<f64> {
        if expected_monthly_expenses <= 0.0 || withdrawal_rate <= 0.0 {
            return None;
        }

        Some(expected_monthly_expenses * 12.0 / withdrawal_rate)
    }

    pub fn years_to_retirement(
        starting_net_worth: f64,
        monthly_contribution: f64,
        expected_monthly_expenses: f64,
        withdrawal_rate: f64,
        annual_return_rate: f64,
    ) -> Option<f64> {
        let target = Self::target_net_worth(expected_monthly_expenses, withdrawal_rate)?;

        if starting_net_worth >= target {
            return Some(0.0);
        }

        let annual_contribution = monthly_contribution * 12.0;

        if annual_return_rate.abs() < f64::EPSILON {
            if annual_contribution <= 0.0 {
                return None;
            }
            return Some((target - starting_net_worth) / annual_contribution);
        }

        let contribution_factor = annual_contribution / annual_return_rate;
        let numerator = target + contribution_factor;
        let denominator = starting_net_worth + contribution_factor;

        if numerator <= 0.0 || denominator <= 0.0 {
            return None;
        }

        let years = (numerator / denominator).ln() / (1.0 + annual_return_rate).ln();

        if !years.is_finite() || years < 0.0 {
            return None;
        }

        Some(years)
    }

    pub fn monthly_income_3pct(net_worth: f64) -> f64 {
        Self::monthly_income_from_withdrawal(net_worth, WITHDRAWAL_RATE_LOW)
    }

    pub fn monthly_income_4pct(net_worth: f64) -> f64 {
        Self::monthly_income_from_withdrawal(net_worth, WITHDRAWAL_RATE_HIGH)
    }

    pub fn calculate_projection(
        starting_net_worth: f64,
        monthly_contribution: f64,
        expected_monthly_expenses: f64,
        return_scenario: &str,
    ) -> Result<RetirementProjection, String> {
        let annual_return_rate = Self::annual_return_rate(return_scenario)?;
        let years_to_retirement = Self::years_to_retirement(
            starting_net_worth,
            monthly_contribution,
            expected_monthly_expenses,
            WITHDRAWAL_RATE_HIGH,
            annual_return_rate,
        )
        .ok_or_else(|| "Retirement goal is not achievable with current inputs".to_string())?;

        let final_net_worth = Self::compound_growth_future_value(
            starting_net_worth,
            monthly_contribution,
            annual_return_rate,
            years_to_retirement,
        );
        let monthly_income_3pct = Self::monthly_income_3pct(final_net_worth);
        let monthly_income_4pct = Self::monthly_income_4pct(final_net_worth);
        let projected_retirement_date = if years_to_retirement <= 0.0 {
            None
        } else {
            let today = Local::now().date_naive();
            let days = (years_to_retirement * 365.25).round() as i64;
            Some(today + Duration::days(days))
        };

        Ok(RetirementProjection {
            projected_retirement_date,
            years_to_retirement,
            final_net_worth,
            monthly_income_3pct,
            monthly_income_4pct,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn annual_return_rate_maps_scenarios() {
        assert_eq!(
            RetirementService::annual_return_rate(RETURN_SCENARIO_CONSERVATIVE).unwrap(),
            RETURN_RATE_CONSERVATIVE
        );
        assert_eq!(
            RetirementService::annual_return_rate(RETURN_SCENARIO_MODERATE).unwrap(),
            RETURN_RATE_MODERATE
        );
        assert_eq!(
            RetirementService::annual_return_rate(RETURN_SCENARIO_AGGRESSIVE).unwrap(),
            RETURN_RATE_AGGRESSIVE
        );
    }

    #[test]
    fn compound_growth_handles_zero_return_rate() {
        let future = RetirementService::compound_growth_future_value(10_000.0, 500.0, 0.0, 2.0);
        let expected = 10_000.0 + 500.0 * 12.0 * 2.0;
        assert!((future - expected).abs() < 0.001);
    }

    #[test]
    fn compound_growth_matches_known_values() {
        let future = RetirementService::compound_growth_future_value(10_000.0, 100.0, 0.10, 1.0);
        let expected = 12_200.0;
        assert!((future - expected).abs() < 0.001);
    }

    #[test]
    fn monthly_income_withdrawal_rates_match_expected() {
        let net_worth = 1_200_000.0;
        assert!((RetirementService::monthly_income_3pct(net_worth) - 3_000.0).abs() < 0.001);
        assert!((RetirementService::monthly_income_4pct(net_worth) - 4_000.0).abs() < 0.001);
    }

    #[test]
    fn compound_growth_applies_all_return_scenarios() {
        let base = 10_000.0;
        let years = 1.0;
        let conservative = RetirementService::compound_growth_future_value(
            base,
            0.0,
            RETURN_RATE_CONSERVATIVE,
            years,
        );
        let moderate =
            RetirementService::compound_growth_future_value(base, 0.0, RETURN_RATE_MODERATE, years);
        let aggressive = RetirementService::compound_growth_future_value(
            base,
            0.0,
            RETURN_RATE_AGGRESSIVE,
            years,
        );

        assert!((conservative - 10_400.0).abs() < 0.001);
        assert!((moderate - 10_700.0).abs() < 0.001);
        assert!((aggressive - 11_000.0).abs() < 0.001);
    }

    #[test]
    fn years_to_retirement_returns_zero_when_already_achievable() {
        let years = RetirementService::years_to_retirement(1_000_000.0, 0.0, 3_000.0, 0.04, 0.07)
            .unwrap();
        assert!((years - 0.0).abs() < f64::EPSILON);
    }

    #[test]
    fn calculate_projection_returns_expected_values_for_already_achievable() {
        let projection = RetirementService::calculate_projection(
            1_200_000.0,
            0.0,
            3_000.0,
            RETURN_SCENARIO_MODERATE,
        )
        .expect("projection");

        assert_eq!(projection.years_to_retirement, 0.0);
        assert_eq!(projection.projected_retirement_date, None);
        assert!((projection.final_net_worth - 1_200_000.0).abs() < 0.001);
        assert!((projection.monthly_income_3pct - 3_000.0).abs() < 0.001);
        assert!((projection.monthly_income_4pct - 4_000.0).abs() < 0.001);
    }

    #[test]
    fn calculate_projection_returns_date_for_future_retirement() {
        let projection = RetirementService::calculate_projection(
            50_000.0,
            500.0,
            3_000.0,
            RETURN_SCENARIO_CONSERVATIVE,
        )
        .expect("projection");

        assert!(projection.years_to_retirement > 0.0);
        let today = Local::now().date_naive();
        assert!(
            projection
                .projected_retirement_date
                .expect("projection date")
                >= today
        );
    }
}
