<?php
require_once __DIR__.'/bootstrap.php';
header('Cache-Control: no-store');
if (!logged()) json_out(['logged_in'=>false]);
if (isset($_GET['notifications'])) {
 try { $q=$conn->prepare('SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0');$q->execute([user_id()]);json_out(['unread'=>(int)$q->fetchColumn()]); } catch(Throwable $e) {json_out(['unread'=>0]);}
}
$q=$conn->prepare('SELECT u.full_name,u.email,p.avatar_path FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.id=?');$q->execute([user_id()]);$row=$q->fetch();
if(!$row)json_out(['logged_in'=>false]);
json_out(['logged_in'=>true,'name'=>$row['full_name'],'email'=>$row['email'],'avatar'=>$row['avatar_path']]);
