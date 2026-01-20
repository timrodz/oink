-- Add is_archived column to accounts table
ALTER TABLE accounts
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT 0;