<?php
require_once __DIR__ . '/bootstrap.php';
if (!logged()) json_out(['success'=>false,'message'=>'Please log in first.'],401);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['success'=>false,'message'=>'POST required'],405);
$data = json_decode(file_get_contents('php://input'),true);
if (!is_array($data)) json_out(['success'=>false,'message'=>'Invalid request'],400);
$title = trim((string)($data['title']??''));
$category = (string)($data['category']??'');
$content = trim((string)($data['content']??''));
$image = trim((string)($data['image']??''));
if (mb_strlen($title)<8 || mb_strlen($title)>120 || !in_array($category,['Academic','Sports','Events','General'],true) || mb_strlen($content)<100 || mb_strlen($content)>30000) {
    json_out(['success'=>false,'message'=>'Check title, category and content length.'],422);
}
if ($image && (!filter_var($image,FILTER_VALIDATE_URL) || !in_array(parse_url($image,PHP_URL_SCHEME),['https','http'],true))) {
    json_out(['success'=>false,'message'=>'Invalid image URL.'],422);
}
try {
    $conn->beginTransaction();
    $description = mb_substr(preg_replace('/\s+/u',' ',$content),0,220);
    // Browse reads from news_articles, so insert here directly.
    $published = $conn->prepare('INSERT INTO news_articles(title,category,description,image,content,created_at) VALUES (?,?,?,?,?,CURDATE())');
    $published->execute([$title,$category,$description,$image,$content]);
    $articleId = (int)$conn->lastInsertId();

    // Optional submission history; approved immediately, never Pending.
    $submitted = $conn->prepare("INSERT INTO article_submissions(title,category,author,image_url,content,status) VALUES(?,?,?,?,?,'Approved')");
    $submitted->execute([$title,$category,(string)($_SESSION['user_name']??'Student'),$image,$content]);
    $submissionId=(int)$conn->lastInsertId();
    $hasOwners=$conn->query("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='submission_owners'")->fetchColumn();
    if($hasOwners) $conn->prepare('INSERT INTO submission_owners(submission_id,user_id) VALUES(?,?)')->execute([$submissionId,user_id()]);

    // Compatible with schemas that store either link_url or article_id, or neither.
    $columns=$conn->query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='notifications'")->fetchAll(PDO::FETCH_COLUMN);
    if($columns){
        $fields=['user_id','title','message'];
        $select=['user_id','?','?'];
        $params=['New '.$category.' article: '.$title,'A new article is available in your subscribed category.'];
        if(in_array('article_id',$columns,true)){$fields[]='article_id';$select[]='?';$params[]=$articleId;}
        if(in_array('link_url',$columns,true)){$fields[]='link_url';$select[]='?';$params[]='article.php?id='.$articleId;}
        if(in_array('category',$columns,true)){$fields[]='category';$select[]='?';$params[]=$category;}
        $query='INSERT INTO notifications ('.implode(',',$fields).') SELECT '.implode(',',$select).' FROM subscriptions WHERE category=?';
        $params[]=$category;
        $conn->prepare($query)->execute($params);
    }
    $conn->commit();
    json_out(['success'=>true,'article_id'=>$articleId,'redirect'=>'browse.php']);
} catch(Throwable $e) {
    if($conn->inTransaction())$conn->rollBack();
    error_log('Direct publishing failure: '.$e->getMessage());
    json_out(['success'=>false,'message'=>'Publishing failed. Check PHP error log and MySQL table columns.'],500);
}
