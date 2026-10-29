<?php
/**
 * Shared helpers for per-category notification tracking.
 * The tables are created safely if the project database has not yet been upgraded.
 */
function ensure_subscription_notification_tables(PDO $conn): void
{
    $conn->exec("CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(180) NOT NULL,
        message TEXT NOT NULL,
        link_url VARCHAR(255) NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notifications_user_read (user_id, is_read),
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $conn->exec("CREATE TABLE IF NOT EXISTS subscription_activity_state (
        user_id INT NOT NULL,
        category VARCHAR(20) NOT NULL,
        last_article_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
        last_submission_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
        last_comment_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, category),
        CONSTRAINT fk_subscription_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

/** Seed the current maximum IDs so old content is not reported as new. */
function seed_subscription_activity(PDO $conn, int $uid, string $category): void
{
    $check = $conn->prepare('SELECT 1 FROM subscription_activity_state WHERE user_id = ? AND category = ? LIMIT 1');
    $check->execute([$uid, $category]);
    if ($check->fetchColumn()) {
        return;
    }

    $q = $conn->prepare('SELECT COALESCE(MAX(id), 0) FROM news_articles WHERE LOWER(category) = LOWER(?)');
    $q->execute([$category]);
    $lastArticle = (int)$q->fetchColumn();

    $q = $conn->prepare('SELECT COALESCE(MAX(id), 0) FROM article_submissions WHERE LOWER(category) = LOWER(?)');
    $q->execute([$category]);
    $lastSubmission = (int)$q->fetchColumn();

    $q = $conn->prepare('SELECT COALESCE(MAX(ac.id), 0)
        FROM article_comments ac
        INNER JOIN news_articles a ON a.id = ac.article_id
        WHERE LOWER(a.category) = LOWER(?)');
    $q->execute([$category]);
    $lastComment = (int)$q->fetchColumn();

    $insert = $conn->prepare('INSERT IGNORE INTO subscription_activity_state
        (user_id, category, last_article_id, last_submission_id, last_comment_id)
        VALUES (?, ?, ?, ?, ?)');
    $insert->execute([$uid, $category, $lastArticle, $lastSubmission, $lastComment]);
}

function insert_subscription_notification(PDO $conn, int $uid, string $title, string $message, string $url): void
{
    $check = $conn->prepare('SELECT id FROM notifications WHERE user_id = ? AND link_url = ? LIMIT 1');
    $check->execute([$uid, $url]);
    if ($check->fetchColumn()) {
        return;
    }

    $insert = $conn->prepare('INSERT INTO notifications (user_id, title, message, link_url, is_read)
        VALUES (?, ?, ?, ?, 0)');
    $insert->execute([$uid, $title, $message, $url]);
}