<?php
// CLI-only, non-destructive migration for an existing news_portal DB.
if(PHP_SAPI!=='cli'){http_response_code(403);exit('CLI only');}
require_once __DIR__.'/db_admin.php';
$pdo=admin_db();
// Upgrade older admin_users tables before loading the seeded admin account.
$pdo->exec("CREATE TABLE IF NOT EXISTS admin_users (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, role ENUM('admin','editor','moderator') NOT NULL DEFAULT 'admin', is_active TINYINT(1) NOT NULL DEFAULT 1, username VARCHAR(80) NULL UNIQUE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$col=$pdo->query("SHOW COLUMNS FROM admin_users LIKE 'username'")->fetch();
if(!$col)$pdo->exec('ALTER TABLE admin_users ADD COLUMN username VARCHAR(80) NULL UNIQUE');
$sql=file_get_contents(__DIR__.'/admin_database.sql');
foreach(explode(';',$sql) as $statement){$statement=preg_replace('/^\s*--[^\n]*\n/m','',$statement);if(trim($statement)!=='')$pdo->exec($statement);}
foreach(['admin_users'=>['username'=>"VARCHAR(80) NULL UNIQUE"], 'announcements'=>['type'=>"VARCHAR(30) NOT NULL DEFAULT 'Featured'",'category'=>"VARCHAR(50) NOT NULL DEFAULT 'General'"]] as $table=>$columns){foreach($columns as $column=>$definition){$q=$pdo->prepare('SHOW COLUMNS FROM `'.$table.'` LIKE ?');$q->execute([$column]);if(!$q->fetch())$pdo->exec('ALTER TABLE `'.$table.'` ADD COLUMN `'.$column.'` '.$definition);}}
echo "Admin migration complete.\n";
