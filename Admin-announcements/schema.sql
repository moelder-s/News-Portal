-- 1) Database create
CREATE DATABASE IF NOT EXISTS news_in_green
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE news_in_green;

-- 2) Table create
CREATE TABLE IF NOT EXISTS announcements (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(140) NOT NULL,
  type       ENUM('Featured','Breaking') NOT NULL DEFAULT 'Featured',
  category   ENUM('Academic','Events','Sports','General') NOT NULL DEFAULT 'General',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3) (Optional) sample rows
INSERT INTO announcements (title, type, category) VALUES
('NSBM Green University Expands Sustainability Initiatives', 'Featured', 'Academic'),
('Annual Tech Fest 2026 - Registration Now Open', 'Breaking', 'Events');