-- Family Expense Tracker Database Schema

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS computed_expenses;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS environment_person;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS environments;

-- Environments table
CREATE TABLE environments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- People table (users)
CREATE TABLE people (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Environment-Person relationship (many-to-many)
CREATE TABLE environment_person (
    environment_id INT NOT NULL,
    person_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (environment_id, person_id),
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    INDEX idx_environment (environment_id),
    INDEX idx_person (person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    payer_id INT NOT NULL,
    registered_by_id INT NOT NULL,
    environment_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payer_id) REFERENCES people(id) ON DELETE RESTRICT,
    FOREIGN KEY (registered_by_id) REFERENCES people(id) ON DELETE RESTRICT,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
    INDEX idx_environment (environment_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_payer (payer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Computed Expenses table (historical archive)
CREATE TABLE computed_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    payer_id INT NOT NULL,
    registered_by_id INT NOT NULL,
    environment_id INT NOT NULL,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    computed_by_id INT NOT NULL,
    FOREIGN KEY (payer_id) REFERENCES people(id) ON DELETE RESTRICT,
    FOREIGN KEY (registered_by_id) REFERENCES people(id) ON DELETE RESTRICT,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
    FOREIGN KEY (computed_by_id) REFERENCES people(id) ON DELETE RESTRICT,
    INDEX idx_environment (environment_id),
    INDEX idx_computed_at (computed_at),
    INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for testing (optional - comment out if not needed)
-- Insert sample person
INSERT INTO people (name, email, password) VALUES 
('Test User', 'test@example.com', '$2b$10$YourHashedPasswordHere');

-- Insert sample environment
INSERT INTO environments (name, description) VALUES 
('Test Family', 'Test family environment');

-- Link person to environment
INSERT INTO environment_person (environment_id, person_id) VALUES (1, 1);