-- Add computed flag to expenses table instead of moving to separate table

ALTER TABLE expenses 
ADD COLUMN is_computed BOOLEAN DEFAULT FALSE AFTER updated_at,
ADD COLUMN computed_at TIMESTAMP NULL AFTER is_computed,
ADD COLUMN computed_by_id INT NULL AFTER computed_at,
ADD FOREIGN KEY (computed_by_id) REFERENCES people(id) ON DELETE SET NULL,
ADD INDEX idx_is_computed (is_computed),
ADD INDEX idx_computed_at (computed_at);

-- Note: computed_expenses table is deprecated but kept for backward compatibility
-- You can drop it later if needed: DROP TABLE computed_expenses;
