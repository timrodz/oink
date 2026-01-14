use crate::models::BalanceSheet;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct BalanceSheetService;

impl BalanceSheetService {
    // LIST
    pub async fn get_all(pool: &SqlitePool) -> Result<Vec<BalanceSheet>, String> {
        sqlx::query_as::<_, BalanceSheet>("SELECT * FROM balance_sheets ORDER BY year DESC")
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())
    }

    // READ
    pub async fn get_by_id(pool: &SqlitePool, id: String) -> Result<Option<BalanceSheet>, String> {
        sqlx::query_as::<_, BalanceSheet>("SELECT * FROM balance_sheets WHERE id = ?")
            .bind(id)
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())
    }

    // UPSERT
    pub async fn upsert(
        pool: &SqlitePool,
        id: Option<String>,
        year: i64,
    ) -> Result<BalanceSheet, String> {
        let now = chrono::Utc::now();

        if let Some(uid) = id {
            let exists: Option<BalanceSheet> = Self::get_by_id(pool, uid.clone()).await?;
            if exists.is_some() {
                return sqlx::query_as::<_, BalanceSheet>(
                    "UPDATE balance_sheets SET year = ? WHERE id = ? RETURNING *",
                )
                .bind(year)
                .bind(uid)
                .fetch_one(pool)
                .await
                .map_err(|e| e.to_string());
            }
        }

        let new_id = Uuid::new_v4().to_string();
        sqlx::query_as::<_, BalanceSheet>(
            "INSERT INTO balance_sheets (id, year, created_at) VALUES (?, ?, ?) RETURNING *",
        )
        .bind(new_id)
        .bind(year)
        .bind(now)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())
    }

    // DELETE
    pub async fn delete(pool: &SqlitePool, id: String) -> Result<(), String> {
        sqlx::query("DELETE FROM balance_sheets WHERE id = ?")
            .bind(id)
            .execute(pool)
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::setup_test_db;

    #[tokio::test]
    async fn test_balance_sheet_crud() {
        let pool = setup_test_db().await;

        // 1. Create
        let sheet = BalanceSheetService::upsert(&pool, None, 2025)
            .await
            .expect("Failed create");
        assert_eq!(sheet.year, 2025);

        // 2. Get All
        let sheets = BalanceSheetService::get_all(&pool)
            .await
            .expect("Failed list");
        assert_eq!(sheets.len(), 1);

        // 3. Update
        let updated = BalanceSheetService::upsert(&pool, Some(sheet.id.clone()), 2026)
            .await
            .expect("Failed update");
        assert_eq!(updated.year, 2026);

        // 4. Delete
        BalanceSheetService::delete(&pool, sheet.id.clone())
            .await
            .expect("Failed delete");
        let check = BalanceSheetService::get_by_id(&pool, sheet.id)
            .await
            .expect("Failed check");
        assert!(check.is_none());
    }
}
