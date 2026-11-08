-- Run AFTER database/news_portal_COMPLETE.sql on the existing news_portal database.
USE `news_portal`;
-- Idempotent installer is in admin_install.php for columns and indexes.
CREATE TABLE IF NOT EXISTS admin_users (
 id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
 role ENUM('admin','editor','moderator') NOT NULL DEFAULT 'admin',
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 username VARCHAR(80) NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS announcements (
 id INT AUTO_INCREMENT PRIMARY KEY,admin_id INT NULL,title VARCHAR(180) NOT NULL,
 body TEXT NOT NULL,is_published TINYINT(1) NOT NULL DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 type VARCHAR(30) NOT NULL DEFAULT 'Featured',category VARCHAR(50) NOT NULL DEFAULT 'General',
 FOREIGN KEY(admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS submission_reviews (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,submission_id INT NOT NULL,admin_id INT NOT NULL,
 decision ENUM('Approved','Rejected') NOT NULL,notes TEXT NULL,reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(submission_id) REFERENCES article_submissions(id) ON DELETE CASCADE,
 FOREIGN KEY(admin_id) REFERENCES admin_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS comment_moderation_logs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,comment_id BIGINT UNSIGNED NOT NULL,admin_id INT NOT NULL,
 action ENUM('Approved','Hidden') NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(comment_id) REFERENCES article_comments(id) ON DELETE CASCADE,
 FOREIGN KEY(admin_id) REFERENCES admin_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shared demonstration admin account for team localhost installations.
-- Username: Newsadmin ; password supplied to the team separately.
INSERT INTO admin_users (full_name,email,username,password_hash,role,is_active)
VALUES ('News Admin','newsadmin@newsin.green','Newsadmin','$2y$12$Jpo9EPEdrefWvsEZIOO8guZwdHKRunfHqgDunTDPQXT9b9QMbsY6m','admin',1)
ON DUPLICATE KEY UPDATE username=VALUES(username), is_active=1;
