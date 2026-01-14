CREATE TABLE IF NOT EXISTS currency_rates (
    id TEXT PRIMARY KEY NOT NULL,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate REAL NOT NULL,
    month INTEGER NOT NULL CHECK(
        month >= 1
        AND month <= 12
    ),
    year INTEGER NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);