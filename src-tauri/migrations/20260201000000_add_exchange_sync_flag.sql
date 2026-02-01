ALTER TABLE user_settings
ADD COLUMN needs_exchange_sync INTEGER NOT NULL DEFAULT 0;
