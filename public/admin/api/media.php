<?php
/**
 * Slike.
 *   GET  ?action=list                         → { items: [{ path, size, pending }] }
 *   GET  ?action=img&path=/images/x.jpg&w=400 → slika (umanjena), za pregled u adminu
 *   POST (multipart) action=upload, file       → { path, width, height, pending: true }
 *   POST {action:"discard", path}             → briše otpremljenu sliku koja još nije objavljena
 *
 * Nova slika se čuva u _data/pending/ i ulazi u repozitorij sa sljedećom objavom (content.php).
 */
require __DIR__ . '/_lib.php';

bootstrap(true);
$cfg = config();

define('SITE_IMG_RE', '#^/(?:images|uploads|video)/[A-Za-z0-9/_.-]+\.(?:jpe?g|png|webp|gif)$#i');
define('THUMB_WIDTHS', '160,400,1200');

/** Stablo repozitorija (putanja → sha) za slike, keširano 60 s. */
function image_tree($fresh = false)
{
    $cfg = config();
    $file = cache_dir() . '/tree.json';
    if (!$fresh && is_file($file) && time() - filemtime($file) < 60) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) {
            return $data;
        }
    }
    $res = gh('GET', '/repos/' . $cfg['repo'] . '/git/trees/' . rawurlencode($cfg['branch']) . '?recursive=1');
    $out = array();
    foreach ($res['tree'] as $e) {
        if ($e['type'] === 'blob' && preg_match('#^public(/(?:images|uploads|video)/.+)$#', $e['path'], $m) && preg_match(IMAGE_EXT_RE, $e['path'])) {
            $out[$m[1]] = array('sha' => $e['sha'], 'size' => isset($e['size']) ? $e['size'] : 0);
        }
    }
    ensure_dir(cache_dir());
    write_file($file, json_encode($out, JSON_UNESCAPED_SLASHES));
    return $out;
}

function slug_name($name)
{
    $name = strtr($name, array(
        'č' => 'c', 'ć' => 'c', 'đ' => 'dj', 'š' => 's', 'ž' => 'z',
        'Č' => 'c', 'Ć' => 'c', 'Đ' => 'dj', 'Š' => 's', 'Ž' => 'z',
    ));
    $name = strtolower(preg_replace('/\.[^.]+$/', '', $name));
    $name = trim(preg_replace('/[^a-z0-9]+/', '-', $name), '-');
    return $name === '' ? 'slika' : substr($name, 0, 50);
}

function output_image($data, $etag, $type)
{
    header('Content-Type: ' . $type);
    header('Cache-Control: private, max-age=300');
    header('ETag: "' . $etag . '"');
    header('X-Content-Type-Options: nosniff');
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH'], '"') === $etag) {
        http_response_code(304);
        exit;
    }
    header('Content-Length: ' . strlen($data));
    echo $data;
    exit;
}

function mime_of($data)
{
    $info = @getimagesizefromstring($data);
    return $info ? $info['mime'] : 'application/octet-stream';
}

/** Umanjena verzija (WebP ako GD podržava, inače PNG/JPEG); null ako nije potrebna ili nije moguća. */
function make_thumb($data, $w)
{
    $info = @getimagesizefromstring($data);
    if (!$info || $info[0] <= $w || $info[0] * $info[1] > 40000000) {
        return null;
    }
    $src = @imagecreatefromstring($data);
    if (!$src) {
        return null;
    }
    $h = max(1, (int) round($info[1] * $w / $info[0]));
    $dst = imagecreatetruecolor($w, $h);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    imagefilledrectangle($dst, 0, 0, $w, $h, imagecolorallocatealpha($dst, 255, 255, 255, 127));
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $w, $h, $info[0], $info[1]);
    ob_start();
    if (function_exists('imagewebp')) {
        imagewebp($dst, null, 80);
        $type = 'image/webp';
    } else {
        imagepng($dst, null, 6);
        $type = 'image/png';
    }
    $out = ob_get_clean();
    imagedestroy($src);
    imagedestroy($dst);
    return array($out, $type);
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

/* ───────── Lista ───────── */
if (method() === 'GET' && $action === 'list') {
    require_token();
    $items = array();
    foreach (pending_uploads() as $repoPath => $local) {
        $items[] = array('path' => substr($repoPath, 6), 'size' => filesize($local), 'pending' => true);
    }
    $tree = image_tree(!empty($_GET['fresh']));
    $paths = array_keys($tree);
    // Najnovije otpremljene prve, zatim ostale slike sajta
    usort($paths, function ($a, $b) {
        $ua = strpos($a, '/uploads/') === 0;
        $ub = strpos($b, '/uploads/') === 0;
        if ($ua !== $ub) {
            return $ua ? -1 : 1;
        }
        return $ua ? strcmp($b, $a) : strcmp($a, $b);
    });
    foreach ($paths as $p) {
        // Originalni štampani letci su ogromni i ne koriste se kao obične slike
        if (preg_match('#^/images/leaflets/[^/]+$#', $p) || strpos($p, '/video/') === 0) {
            continue;
        }
        $items[] = array('path' => $p, 'size' => $tree[$p]['size'], 'pending' => false);
    }
    send_json(array('items' => $items));
}

/* ───────── Pregled slike ───────── */
if (method() === 'GET' && $action === 'img') {
    $path = isset($_GET['path']) ? (string) $_GET['path'] : '';
    if (!preg_match(SITE_IMG_RE, $path) || strpos($path, '..') !== false) {
        fail('Neispravna putanja slike.');
    }
    $w = isset($_GET['w']) ? (int) $_GET['w'] : 0;
    if ($w !== 0 && !in_array((string) $w, explode(',', THUMB_WIDTHS), true)) {
        $w = 400;
    }
    ensure_dir(cache_dir());

    $pendingFile = pending_dir() . '/public' . $path;
    if (is_file($pendingFile)) {
        $data = file_get_contents($pendingFile);
        $sha = git_blob_sha($data);
    } else {
        require_token();
        $tree = image_tree();
        if (!isset($tree[$path])) {
            $tree = image_tree(true);
        }
        if (!isset($tree[$path])) {
            fail('Slika nije pronađena.', 404);
        }
        $sha = $tree[$path]['sha'];
        $blobFile = cache_dir() . '/' . $sha . '.bin';
        if (is_file($blobFile)) {
            $data = null;
        } else {
            $data = gh('GET', '/repos/' . $cfg['repo'] . '/git/blobs/' . $sha, null, true);
            write_file($blobFile, $data);
        }
    }

    if ($w > 0) {
        $thumbFile = cache_dir() . '/' . $sha . '-w' . $w . '.thumb';
        if (is_file($thumbFile)) {
            $t = file_get_contents($thumbFile);
            output_image($t, $sha . '-' . $w, mime_of($t));
        }
        if ($data === null) {
            $data = file_get_contents(cache_dir() . '/' . $sha . '.bin');
        }
        $thumb = make_thumb($data, $w);
        if ($thumb !== null) {
            write_file($thumbFile, $thumb[0]);
            output_image($thumb[0], $sha . '-' . $w, $thumb[1]);
        }
    }
    if ($data === null) {
        $data = file_get_contents(cache_dir() . '/' . $sha . '.bin');
    }
    output_image($data, $sha, mime_of($data));
}

if (method() !== 'POST') {
    fail('Metoda nije dozvoljena.', 405);
}

/* ───────── Otpremanje ───────── */
if (isset($_POST['action']) && $_POST['action'] === 'upload') {
    if (!isset($_FILES['file'])) {
        fail('Slika nije poslana (možda je prevelika).');
    }
    $f = $_FILES['file'];
    if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) {
        fail('Slika je prevelika (najviše 15 MB).', 413);
    }
    if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
        fail('Otpremanje nije uspjelo (greška ' . $f['error'] . ').');
    }
    if ($f['size'] > 15 * 1024 * 1024) {
        fail('Slika je prevelika (najviše 15 MB).', 413);
    }
    $info = @getimagesize($f['tmp_name']);
    $types = array(IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_GIF => 'gif');
    if (defined('IMAGETYPE_WEBP')) {
        $types[IMAGETYPE_WEBP] = 'webp';
    }
    if (!$info || !isset($types[$info[2]])) {
        fail('Dozvoljene su samo slike JPG, PNG, WebP i GIF.', 415);
    }
    if ($info[0] < 16 || $info[1] < 16 || $info[0] > 12000 || $info[1] > 16000) {
        fail('Neobične dimenzije slike (' . $info[0] . '×' . $info[1] . ' px).', 415);
    }
    $base = slug_name(isset($_POST['name']) && $_POST['name'] !== '' ? $_POST['name'] : $f['name']);
    $repoPath = 'public/uploads/' . date('Y/m') . '/' . $base . '-' . bin2hex(random_bytes(3)) . '.' . $types[$info[2]];
    $target = pending_dir() . '/' . $repoPath;
    ensure_dir(dirname($target));
    if (!move_uploaded_file($f['tmp_name'], $target)) {
        fail('Snimanje slike nije uspjelo.', 500);
    }
    audit('slika', $repoPath);
    send_json(array(
        'path' => substr($repoPath, 6),
        'width' => $info[0],
        'height' => $info[1],
        'size' => filesize($target),
        'pending' => true,
    ));
}

$in = json_input();
if (isset($in['action']) && $in['action'] === 'discard') {
    $path = isset($in['path']) ? (string) $in['path'] : '';
    if (!preg_match('#^/uploads/[A-Za-z0-9/_.-]+$#', $path) || strpos($path, '..') !== false) {
        fail('Neispravna putanja.');
    }
    $file = pending_dir() . '/public' . $path;
    if (is_file($file)) {
        @unlink($file);
    }
    send_json(array('ok' => true));
}

fail('Nepoznata akcija.');
