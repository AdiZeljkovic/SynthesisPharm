<?php
/**
 * Sadržaj sajta (src/content/** u GitHub repozitoriju).
 *   GET ?path=src/content/site.json        → { path, sha, content }
 *   GET ?dir=src/content/blog              → { files: [{ path, sha, content }] }
 *   POST { message, files: [{path, content, baseSha?}], deletes: [{path, baseSha?}], force? }
 *        → jedan commit (+ sve slike koje čekaju objavu) → GitHub Actions builda i objavljuje sajt
 */
require __DIR__ . '/_lib.php';

bootstrap(true);
require_token();
$cfg = config();

function check_path($path)
{
    if (!is_string($path) || !preg_match(CONTENT_PATH_RE, $path) || strpos($path, '..') !== false) {
        fail('Nedozvoljena putanja: ' . (is_string($path) ? $path : '?'));
    }
    return $path;
}

if (method() === 'GET') {
    if (isset($_GET['path'])) {
        send_json(gh_file(check_path($_GET['path'])));
    }
    if (isset($_GET['dir'])) {
        $dir = (string) $_GET['dir'];
        if (!preg_match('#^src/content/[a-z0-9-]+$#', $dir)) {
            fail('Nedozvoljen folder.');
        }
        try {
            $list = gh('GET', '/repos/' . $cfg['repo'] . '/contents/' . repo_path($dir) . '?ref=' . rawurlencode($cfg['branch']));
        } catch (GhError $e) {
            if ($e->status === 404) {
                send_json(array('files' => array()));
            }
            throw $e;
        }
        $paths = array();
        $metas = array();
        foreach ($list as $item) {
            if ($item['type'] === 'file' && preg_match(CONTENT_PATH_RE, $item['path'])) {
                $paths[] = '/repos/' . $cfg['repo'] . '/contents/' . repo_path($item['path']) . '?ref=' . rawurlencode($cfg['branch']);
                $metas[] = $item;
            }
        }
        $files = array();
        foreach (gh_many($paths) as $i => $f) {
            if ($f !== null && isset($f['content'])) {
                $files[] = array('path' => $metas[$i]['path'], 'sha' => $f['sha'], 'content' => base64_decode($f['content']));
            }
        }
        send_json(array('files' => $files));
    }
    fail('Nedostaje parametar.');
}

if (method() !== 'POST') {
    fail('Metoda nije dozvoljena.', 405);
}

$in = json_input();
$message = isset($in['message']) ? trim(preg_replace('/\s+/', ' ', (string) $in['message'])) : '';
$message = $message === '' ? 'Admin: izmjena sadržaja' : mb_substr($message, 0, 120);
$force = !empty($in['force']);
$files = isset($in['files']) && is_array($in['files']) ? $in['files'] : array();
$deletes = isset($in['deletes']) && is_array($in['deletes']) ? $in['deletes'] : array();

$commitFiles = array();
$newShas = array();
$conflicts = array();

foreach ($files as $f) {
    $path = check_path(isset($f['path']) ? $f['path'] : null);
    $content = isset($f['content']) ? $f['content'] : null;
    if (!is_string($content) || strlen($content) > 1048576) {
        fail('Neispravan sadržaj: ' . $path);
    }
    if (!mb_check_encoding($content, 'UTF-8')) {
        fail('Tekst nije u UTF-8 kodiranju: ' . $path);
    }
    $content = str_replace("\r\n", "\n", $content);
    if (substr($path, -5) === '.json') {
        json_decode($content);
        if (json_last_error() !== JSON_ERROR_NONE) {
            fail('Neispravan JSON (' . json_last_error_msg() . '): ' . $path);
        }
    } elseif (strpos($content, "---\n") !== 0) {
        fail('Blog tekst mora počinjati zaglavljem (---): ' . $path);
    }
    if (!$force && array_key_exists('baseSha', $f)) {
        $current = gh_file_sha($path);
        if ($current !== $f['baseSha']) {
            $conflicts[] = $path;
        }
    }
    $commitFiles[] = array('path' => $path, 'content' => $content);
    $newShas[$path] = git_blob_sha($content);
}

$deletePaths = array();
foreach ($deletes as $d) {
    $path = check_path(isset($d['path']) ? $d['path'] : null);
    $current = gh_file_sha($path);
    if ($current === null) {
        continue; // već obrisano
    }
    if (!$force && isset($d['baseSha']) && $current !== $d['baseSha']) {
        $conflicts[] = $path;
    }
    $deletePaths[] = $path;
}

if (count($conflicts) > 0) {
    send_json(array(
        'error' => 'Sadržaj je u međuvremenu promijenjen (možda u drugom prozoru ili od strane druge osobe).',
        'conflicts' => $conflicts,
    ), 409);
}

// Slike otpremljene u adminu idu u isti commit
$pending = pending_uploads();
foreach ($pending as $repoPath => $local) {
    $commitFiles[] = array('path' => $repoPath, 'content' => file_get_contents($local));
}

$sha = gh_commit($commitFiles, $deletePaths, $message);

// Objavljene slike: premjesti u keš (pregled u adminu radi i prije nego GitHub Actions završi)
ensure_dir(cache_dir());
foreach ($pending as $repoPath => $local) {
    $blob = git_blob_sha(file_get_contents($local));
    $target = cache_dir() . '/' . $blob . '.bin';
    if (!is_file($target)) {
        @rename($local, $target);
    }
    @unlink($local);
}
@unlink(cache_dir() . '/tree.json');

audit('objava', $message . ' (' . substr($sha, 0, 7) . ')');
send_json(array('ok' => true, 'commit' => $sha, 'files' => $newShas, 'uploads' => count($pending)));
