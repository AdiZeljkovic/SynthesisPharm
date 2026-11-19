<?php
/**
 * Postavke admina.
 *   GET                                         → { repo, branch, tokenSet, tokenCheck, log }
 *   POST {action:"password", current, password}
 *   POST {action:"token", token}                → provjeri token na repozitoriju pa ga sačuvaj
 */
require __DIR__ . '/_lib.php';

bootstrap(true);
$cfg = config();

/**
 * Stvarna provjera tokena: čitanje repoa, pisanje (pravi bezopasan Git blob – ne mijenja ništa u repou
 * i ne pokreće objavu) i čitanje GitHub Actions. Napomena: "permissions" iz GET /repos pokazuje prava
 * korisnika, ne fine-grained tokena, pa se na to ne može osloniti.
 */
function check_token($cfg, $token)
{
    try {
        gh('GET', '/repos/' . $cfg['repo'], null, false, $token);
    } catch (ApiError $e) {
        return array('ok' => false, 'message' => 'Token ne može pročitati repozitorij ' . $cfg['repo'] . '. Provjerite "Repository access".');
    }
    try {
        gh('POST', '/repos/' . $cfg['repo'] . '/git/blobs', array('content' => 'provjera tokena', 'encoding' => 'utf-8'), false, $token);
    } catch (ApiError $e) {
        return array('ok' => false, 'message' => 'Token nema dozvolu za pisanje. U GitHubu uredite token: Repository permissions → Contents: Read and write.');
    }
    try {
        gh('GET', '/repos/' . $cfg['repo'] . '/actions/runs?per_page=1', null, false, $token);
    } catch (ApiError $e) {
        return array('ok' => false, 'message' => 'Token nema dozvolu "Actions: Read-only" (potrebno za praćenje objave).');
    }
    return array('ok' => true, 'message' => 'Token radi (čitanje, pisanje i praćenje objave).');
}

if (method() === 'GET') {
    $check = null;
    if ($cfg['github_token'] !== '') {
        $check = check_token($cfg, $cfg['github_token']);
    }
    $log = array_slice(read_guarded('log', array()), 0, 30);
    send_json(array(
        'repo' => $cfg['repo'],
        'branch' => $cfg['branch'],
        'tokenSet' => $cfg['github_token'] !== '',
        'tokenCheck' => $check,
        'log' => $log,
    ));
}

if (method() !== 'POST') {
    fail('Metoda nije dozvoljena.', 405);
}

$in = json_input();
$action = isset($in['action']) ? $in['action'] : '';

if ($action === 'password') {
    $current = isset($in['current']) ? (string) $in['current'] : '';
    $new = isset($in['password']) ? (string) $in['password'] : '';
    if (!password_verify($current, $cfg['password_hash'])) {
        fail('Trenutna lozinka nije tačna.', 403);
    }
    if (strlen($new) < 10 || strlen($new) > 200) {
        fail('Nova lozinka mora imati najmanje 10 znakova.');
    }
    save_config(array('password_hash' => password_hash($new, PASSWORD_DEFAULT)));
    audit('promjena lozinke');
    send_json(array('ok' => true));
}

if ($action === 'token') {
    $token = isset($in['token']) ? trim((string) $in['token']) : '';
    if (!preg_match('/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/', $token)) {
        fail('To ne izgleda kao GitHub token (počinje sa github_pat_ ili ghp_).');
    }
    $check = check_token($cfg, $token);
    if (!$check['ok']) {
        fail($check['message']);
    }
    save_config(array('github_token' => $token));
    audit('novi GitHub token');
    send_json(array('ok' => true));
}

fail('Nepoznata akcija.');
