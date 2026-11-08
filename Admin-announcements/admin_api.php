<?php
require_once __DIR__.'/db_admin.php';
/** Preserve deleted records before cascading removal; keeps live statistics accurate. */
function ensure_deleted_history(): void {
  admin_db()->exec("CREATE TABLE IF NOT EXISTS deleted_articles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    original_article_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    content LONGTEXT NULL,
    published_at DATE NULL,
    deleted_by INT NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (original_article_id), INDEX (deleted_at)
  ) ENGINE=InnoDB");
  admin_db()->exec("CREATE TABLE IF NOT EXISTS deleted_article_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    original_comment_id BIGINT UNSIGNED NOT NULL,
    original_article_id INT NOT NULL,
    user_id INT NOT NULL,
    article_title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    commented_at TIMESTAMP NULL,
    deleted_by INT NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (original_article_id), INDEX (deleted_at)
  ) ENGINE=InnoDB");
}

try {
$method=$_SERVER['REQUEST_METHOD'];$data=admin_input();$action=(string)($_GET['action']??$data['action']??'');
if($action==='login'&&$method==='POST'){
  $id=trim((string)($data['userId']??''));$pass=(string)($data['password']??'');
  $row=admin_row('SELECT * FROM admin_users WHERE (email=? OR username=?) AND is_active=1',[$id,$id]);
  if(!$row||!password_verify($pass,$row['password_hash']))admin_json(['ok'=>false,'error'=>'Invalid admin credentials'],401);
  session_regenerate_id(true);$_SESSION['admin_id']=$row['id'];admin_json(['ok'=>true,'csrf'=>admin_csrf(),'user'=>['name'=>$row['full_name'],'email'=>$row['email'],'role'=>$row['role']]]);
}
if($action==='logout'){if($method!=='POST')admin_json(['ok'=>false,'error'=>'POST required'],405);admin_write($data);unset($_SESSION['admin_id'],$_SESSION['admin_csrf']);session_regenerate_id(true);admin_json(['ok'=>true]);}
if($action==='session'){ $user=admin_auth();admin_json(['ok'=>true,'user'=>$user,'csrf'=>admin_csrf()]);}
$user=admin_auth();if($method!=='GET')admin_write($data);
if($action==='comments'){
 if($method==='GET')admin_json(['ok'=>true,'items'=>admin_query('SELECT c.id,c.body,c.status,c.created_at,u.full_name AS author,a.title AS article_title FROM article_comments c JOIN users u ON u.id=c.user_id JOIN news_articles a ON a.id=c.article_id WHERE c.status <> \'Hidden\' ORDER BY c.created_at DESC LIMIT 300')->fetchAll()]);
 $id=(int)($data['id']??0);$op=$data['decision']??'';if(!in_array($op,['Approved','Hidden'],true))admin_json(['ok'=>false,'error'=>'Invalid status'],422);
 admin_db()->beginTransaction();try{admin_query('UPDATE article_comments SET status=? WHERE id=?',[$op,$id]);admin_query('INSERT INTO comment_moderation_logs(comment_id,admin_id,action) VALUES(?,?,?)',[$id,$user['id'],$op]);admin_db()->commit();}catch(Throwable $e){admin_db()->rollBack();throw $e;}admin_json(['ok'=>true]);
}
if($action==='approvals'){
 if($method==='GET')admin_json(['ok'=>true,'items'=>admin_query("SELECT id,title,category,author,content,submitted_at,image_url FROM article_submissions WHERE status='Pending' ORDER BY submitted_at ASC LIMIT 300")->fetchAll()]);
 $id=(int)($data['id']??0);$decision=$data['decision']??'';if(!in_array($decision,['Approved','Rejected'],true))admin_json(['ok'=>false,'error'=>'Invalid decision'],422);
 admin_db()->beginTransaction();try{$submission=admin_row('SELECT * FROM article_submissions WHERE id=? FOR UPDATE',[$id]);if(!$submission || $submission['status']!=='Pending')throw new RuntimeException('This submission is no longer pending');admin_query('UPDATE article_submissions SET status=? WHERE id=?',[$decision,$id]);admin_query('INSERT INTO submission_reviews(submission_id,admin_id,decision) VALUES(?,?,?)',[$id,$user['id'],$decision]);if($decision==='Approved'){$desc=mb_substr(trim(preg_replace('/\s+/u',' ',$submission['content'])),0,220);admin_query('INSERT INTO news_articles(title,category,description,image,content,created_at) VALUES(?,?,?,?,?,CURDATE())',[$submission['title'],$submission['category'],$desc,$submission['image_url'],$submission['content']]);$articleId=(int)admin_db()->lastInsertId();admin_query('INSERT INTO notifications(user_id,article_id,category,title,message) SELECT s.user_id,?,s.category,?,? FROM subscriptions s WHERE LOWER(s.category)=LOWER(?)',[$articleId,'New '.$submission['category'].' article: '.$submission['title'],'A new article has been published in your subscribed category.',$submission['category']]);}admin_db()->commit();}catch(Throwable $e){admin_db()->rollBack();throw $e;}admin_json(['ok'=>true]);
}
if($action==='articles'){
 if($method==='GET')admin_json(['ok'=>true,'items'=>admin_query('SELECT id,title,category,description,image,content,created_at FROM news_articles ORDER BY id DESC LIMIT 300')->fetchAll()]);
 $id=(int)($data['id']??0);if(($data['operation']??'')==='delete'){
   if($id<=0)admin_json(['ok'=>false,'error'=>'Invalid article'],422);
   ensure_deleted_history();
   admin_db()->beginTransaction();
   try {
     $article=admin_row('SELECT * FROM news_articles WHERE id=? FOR UPDATE',[$id]);
     if(!$article)throw new RuntimeException('Article no longer exists');
     admin_query('INSERT INTO deleted_articles (original_article_id,title,category,description,image,content,published_at,deleted_by) VALUES (?,?,?,?,?,?,?,?)',
       [$id,$article['title'],$article['category'],$article['description']??null,$article['image']??null,$article['content']??null,$article['created_at']??null,$user['id']]);
     admin_query('INSERT INTO deleted_article_comments (original_comment_id,original_article_id,user_id,article_title,body,status,commented_at,deleted_by) SELECT c.id,c.article_id,c.user_id,?,c.body,c.status,c.created_at,? FROM article_comments c WHERE c.article_id=?',
       [$article['title'],$user['id'],$id]);
     // The live comment records are removed before their article is deleted.
     // Dependent moderation logs are removed by the existing cascading foreign keys.
     admin_query('DELETE FROM article_comments WHERE article_id=?',[$id]);
     admin_query('DELETE FROM news_articles WHERE id=?',[$id]);
     admin_db()->commit();
   } catch(Throwable $e) {admin_db()->rollBack();throw $e;}
   admin_json(['ok'=>true]);
 }
 $title=admin_required((string)($data['title']??''),255);$category=admin_required((string)($data['category']??''),50);$content=admin_required((string)($data['content']??''),100000);$description=mb_substr(trim(preg_replace('/\s+/u',' ',$content)),0,220);$image=substr(trim((string)($data['image']??'')),0,255);
 if($id){admin_query('UPDATE news_articles SET title=?,category=?,description=?,image=?,content=? WHERE id=?',[$title,$category,$description,$image,$content,$id]);}else{admin_query('INSERT INTO news_articles(title,category,description,image,content,created_at) VALUES(?,?,?,?,?,CURDATE())',[$title,$category,$description,$image,$content]);}admin_json(['ok'=>true]);
}
if($action==='categories'){
 if($method==='GET')admin_json(['ok'=>true,'items'=>admin_query('SELECT id,name,slug,is_active FROM news_categories ORDER BY name')->fetchAll()]);
 $id=(int)($data['id']??0);if(($data['operation']??'')==='delete'){admin_query('DELETE FROM news_categories WHERE id=?',[$id]);admin_json(['ok'=>true]);}$name=admin_required((string)($data['name']??''),50);$slug=admin_slug($name);if($id){admin_query('UPDATE news_categories SET name=?,slug=? WHERE id=?',[$name,$slug,$id]);}else{admin_query('INSERT INTO news_categories(name,slug) VALUES(?,?)',[$name,$slug]);}admin_json(['ok'=>true]);
}
if($action==='announcements'){
 if($method==='GET')admin_json(['ok'=>true,'items'=>admin_query('SELECT id,title,body,type,category,is_published,created_at FROM announcements ORDER BY id DESC LIMIT 300')->fetchAll()]);
 $id=(int)($data['id']??0);if(($data['operation']??'')==='delete'){admin_query('DELETE FROM announcements WHERE id=?',[$id]);admin_json(['ok'=>true]);}
 $title=admin_required((string)($data['title']??''),180);$body=admin_required((string)($data['body']??''));$type=substr((string)($data['type']??'Featured'),0,30);$category=substr((string)($data['category']??'General'),0,50);admin_query('INSERT INTO announcements(admin_id,title,body,type,category,is_published) VALUES(?,?,?,?,?,1)',[$user['id'],$title,$body,$type,$category]);admin_json(['ok'=>true]);
}
if($action==='password'){
 if($method!=='POST')admin_json(['ok'=>false,'error'=>'POST required'],405);$row=admin_row('SELECT password_hash FROM admin_users WHERE id=?',[$user['id']]);$current=(string)($data['current']??'');$new=(string)($data['new']??'');if(!password_verify($current,$row['password_hash'])||strlen($new)<12)admin_json(['ok'=>false,'error'=>'Incorrect current password or new password too short (12 characters minimum)'],422);admin_query('UPDATE admin_users SET password_hash=? WHERE id=?',[password_hash($new,PASSWORD_DEFAULT),$user['id']]);admin_json(['ok'=>true]);
}
if($action==='profile'){
 if($method==='POST'){$name=admin_required((string)($data['name']??''),100);admin_query('UPDATE admin_users SET full_name=? WHERE id=?',[$name,$user['id']]);admin_json(['ok'=>true]);}admin_json(['ok'=>true,'user'=>$user]);
}
if($action==='deleted_history'){
 ensure_deleted_history();
 admin_json(['ok'=>true,
   'articles'=>admin_query('SELECT original_article_id,title,category,deleted_at FROM deleted_articles ORDER BY id DESC LIMIT 100')->fetchAll(),
   'comments'=>admin_query('SELECT original_comment_id,article_title,body,deleted_at FROM deleted_article_comments ORDER BY id DESC LIMIT 100')->fetchAll()
 ]);
}
if($action==='reports'||$action==='dashboard'){
 $counts=[];foreach(['users'=>'users','articles'=>'news_articles','views'=>'article_views','bookmarks'=>'bookmarks','comments'=>'article_comments','pending'=>'article_submissions','subscriptions'=>'subscriptions'] as $key=>$table){$where=$key==='pending'?" WHERE status='Pending'":'';$counts[$key]=(int)admin_db()->query('SELECT COUNT(*) FROM '.$table.$where)->fetchColumn();}
 $counts['pending_comments']=(int)admin_db()->query("SELECT COUNT(*) FROM article_comments WHERE status='Pending'")->fetchColumn();
 $counts['featured']=(int)admin_db()->query("SELECT COUNT(*) FROM announcements WHERE is_published=1")->fetchColumn();
 $top=admin_query('SELECT a.id,a.title,a.category,COUNT(DISTINCT v.id) AS views,COUNT(DISTINCT b.id) AS bookmarks FROM news_articles a LEFT JOIN article_views v ON v.article_id=a.id LEFT JOIN bookmarks b ON b.article_id=a.id GROUP BY a.id,a.title,a.category ORDER BY views DESC,bookmarks DESC LIMIT 10')->fetchAll();
 $recent=admin_query('SELECT id,title,category,created_at FROM news_articles ORDER BY id DESC LIMIT 10')->fetchAll();admin_json(['ok'=>true,'counts'=>$counts,'top'=>$top,'recent'=>$recent]);
}
admin_json(['ok'=>false,'error'=>'Unknown endpoint'],404);
}catch(Throwable $e){error_log('Admin API: '.$e->getMessage());admin_json(['ok'=>false,'error'=>$e instanceof RuntimeException?$e->getMessage():'Database operation failed; check server logs and apply admin_database.sql'],500);}
