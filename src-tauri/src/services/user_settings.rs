use crate::models::UserSettings;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct UserSettingsService;

impl UserSettingsService {
    // LIST
    pub async fn get_all(pool: &SqlitePool) -> Result<Vec<UserSettings>, String> {
        sqlx::query_as::<_, UserSettings>("SELECT * FROM user_settings")
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())
    }

    // READ
    pub async fn get_by_id(pool: &SqlitePool, id: String) -> Result<Option<UserSettings>, String> {
        sqlx::query_as::<_, UserSettings>("SELECT * FROM user_settings WHERE id = ?")
            .bind(id)
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())
    }

    // UPSERT
    pub async fn upsert(
        pool: &SqlitePool,
        id: Option<String>,
        name: String,
        home_currency: String,
    ) -> Result<UserSettings, String> {
        let now = chrono::Utc::now();

        if let Some(uid) = id {
            // Check if exists
            let exists: Option<UserSettings> = Self::get_by_id(pool, uid.clone()).await?;
            if exists.is_some() {
                return sqlx::query_as::<_, UserSettings>(
                    "UPDATE user_settings SET name = ?, home_currency = ?, updated_at = ? WHERE id = ? RETURNING *"
                )
                .bind(name)
                .bind(home_currency)
                .bind(now)
                .bind(uid)
                .fetch_one(pool)
                .await
                .map_err(|e| e.to_string());
            }
        }

        // Insert new
        let new_id = Uuid::new_v4().to_string();
        sqlx::query_as::<_, UserSettings>(
            "INSERT INTO user_settings (id, name, home_currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *"
        )
        .bind(new_id)
        .bind(name)
        .bind(home_currency)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())
    }

    // DELETE
    pub async fn delete(pool: &SqlitePool, id: String) -> Result<(), String> {
        sqlx::query("DELETE FROM user_settings WHERE id = ?")
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
    async fn test_user_settings_crud() {
        let pool = setup_test_db().await;

        // 1. Upsert (Create)
        let created = UserSettingsService::upsert(&pool, None, "Test User".into(), "NZD".into())
            .await
            .expect("Failed to create user settings");

        assert_eq!(created.name, "Test User");
        assert_eq!(created.home_currency, "NZD");

        // 2. Get All
        let all = UserSettingsService::get_all(&pool)
            .await
            .expect("Failed to get all");
        assert_eq!(all.len(), 1);

        // 3. Get By ID
        let fetched = UserSettingsService::get_by_id(&pool, created.id.clone())
            .await
            .expect("Failed to get by id");
        assert!(fetched.is_some());
        assert_eq!(fetched.unwrap().id, created.id);

        // 4. Upsert (Update)
        let updated = UserSettingsService::upsert(
            &pool,
            Some(created.id.clone()),
            "Updated User".into(),
            "USD".into(),
        )
        .await
        .expect("Failed to update");
        assert_eq!(updated.name, "Updated User");
        assert_eq!(updated.home_currency, "USD");
        assert_eq!(updated.id, created.id); // ID should remain same

        // 5. Delete
        UserSettingsService::delete(&pool, created.id.clone())
            .await
            .expect("Failed to delete");
        let after_delete = UserSettingsService::get_by_id(&pool, created.id)
            .await
            .expect("Failed to get");
        assert!(after_delete.is_none());
    }
}
