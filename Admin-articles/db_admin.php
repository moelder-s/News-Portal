<?php
declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }
require_once __DIR__ . '/db.php';
function admin_db(): PDO { global $conn; return $conn; }
function admin_json($value,int $code=200): void {http_response_code($code);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');echo json_encode($value,JSON_UNESCAPED_UNICODE);exit;}
function admin_input(): array { $data=json_decode(file_get_contents('php://input'),true);return is_array($data)?$data:$_POST;}
function admin_csrf():string {return $_SESSION['admin_csrf']??($_SESSION['admin_csrf']=bin2hex(random_bytes(24)));}
function admin_auth(): array {if(empty($_SESSION['admin_id']))admin_json(['ok'=>false,'error'=>'Login required'],401);$q=admin_db()->prepare('SELECT id,full_name,email,role,is_active FROM admin_users WHERE id=?');$q->execute([$_SESSION['admin_id']]);$user=$q->fetch();if(!$user || !(int)$user['is_active']){unset($_SESSION['admin_id']);admin_json(['ok'=>false,'error'=>'Account disabled'],401);}return $user;}
function admin_write(array $data):void {if(!hash_equals(admin_csrf(),(string)($_SERVER['HTTP_X_CSRF_TOKEN']??$data['csrf']??'')))admin_json(['ok'=>false,'error'=>'Invalid CSRF token'],419);}
function admin_query(string $sql,array $args=[]):PDOStatement{$q=admin_db()->prepare($sql);$q->execute($args);return $q;}
function admin_row(string $sql,array $args=[]):?array{$r=admin_query($sql,$args)->fetch();return $r?:null;}
function admin_required(string $v,int $max=5000):string{$v=trim($v);if($v===''||mb_strlen($v)>$max)admin_json(['ok'=>false,'error'=>'Invalid or missing input'],422);return $v;}
function admin_slug(string $value):string{$v=strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/','-',$value),'-'));return $v?:'category';}