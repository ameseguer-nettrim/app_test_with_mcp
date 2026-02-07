CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'tag', -- Para tu UI de Vue3
    color VARCHAR(7) DEFAULT '#0284c7', -- Color de Tailwind para el gráfico
    environment_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
    INDEX idx_environment_category (environment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Añadir a gastos actuales
ALTER TABLE expenses 
ADD COLUMN category_id INT AFTER environment_id,
ADD FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT;

-- Añadir a histórico
ALTER TABLE computed_expenses 
ADD COLUMN category_id INT AFTER environment_id,
ADD FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT;