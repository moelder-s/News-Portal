<?php
// Run using command-line only, AFTER admin_install.php.
if(PHP_SAPI!=='cli'){http_response_code(403);exit('CLI only');}
require_once __DIR__.'/db_admin.php';
if($argc<5){fwrite(STDERR,"Usage: php admin_create.php username email password 'Full Name'\n");exit(1);}
[$script,$username,$email,$password,$name]=$argv;
if(!preg_match('/^[A-Za-z0-9_.-]{4,80}$/',$username)||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($password)<8||trim($name)===''){fwrite(STDERR,"Use a username of 4+ letters/digits, valid email, password of 8+ characters, and name.\n");exit(1);}
admin_query('INSERT INTO admin_users(username,email,password_hash,full_name,role,is_active) VALUES(?,?,?,?,?,1)',[$username,$email,password_hash($password,PASSWORD_DEFAULT),$name,'admin']);echo "Admin account created.\n";
