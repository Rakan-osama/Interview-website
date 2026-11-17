CREATE DATABASE IF NOT EXISTS interview_website
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE interview_website;

CREATE TABLE IF NOT EXISTS user_progress (
  profile_id VARCHAR(100) NOT NULL PRIMARY KEY,
  progress_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_progress_json CHECK (JSON_VALID(progress_json))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
