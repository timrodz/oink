CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY NOT NULL,
    balance_sheet_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    month INTEGER NOT NULL CHECK(
        month >= 1
        AND month <= 12
    ),
    amount REAL NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (balance_sheet_id) REFERENCES balance_sheets(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);