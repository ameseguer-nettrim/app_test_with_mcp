CREATE TABLE environment_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  environment_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  created_by INT NOT NULL,
  FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES people(id)
);