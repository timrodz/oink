-- Add inflation_rate column to retirement_plans table
ALTER TABLE retirement_plans
ADD COLUMN inflation_rate REAL NOT NULL DEFAULT 0.0;
