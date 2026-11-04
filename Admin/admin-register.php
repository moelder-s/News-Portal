<?php
declare(strict_types=1);
require_once __DIR__ . '/db_admin.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') admin_json(['success'=>false,'message'=>'POST required'],405);
try {
    $data=admin_input();
    $name=trim((string)($data['full_name']??''));
    $email=trim((string)($data['email']??''));
    $username=trim((string)($data['user_id']??''));
    $password=(string)($data['password']??'');
    if($name==='' || strlen($name)>100 || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>150 || !preg_match('/^[A-Za-z0-9_.-]{3,80}$/',$username) || strlen($password)<8) {
        admin_json(['success'=>false,'message'=>'Enter a name, valid email, user ID and password (8+ characters).'],422);
    }
    $exists=admin_row('SELECT id FROM admin_users WHERE username=? OR email=?',[$username,$email]);
    if($exists) admin_json(['success'=>false,'message'=>'Username or email is already registered.'],409);
    admin_query('INSERT INTO admin_users(full_name,email,username,password_hash,role,is_active) VALUES(?,?,?,?,?,1)',
        [$name,$email,$username,password_hash($password,PASSWORD_DEFAULT),'admin']);
    admin_json(['success'=>true,'message'=>'Admin account created. You can now log in.']);
} catch(PDOException $e) {
    error_log('Admin registration: '.$e->getMessage());
    admin_json(['success'=>false,'message'=>'Could not create account. Check database setup.'],500);
}
