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

if (method() === 'GET') {
    $check = null;
    if ($cfg['github_token'] !== '') {
        try {
            $repo = gh('GET', '/repos/' . $cfg['repo']);
            $check = array('ok' => !empty($repo['permissions']['push']), 'message' => !empty($repo['permissions']['push']) ? 'Token radi.' : 'Token nema dozvolu za pisanje u repozitorij.');
        } catch (ApiError $e) {
            $check = array('ok' => false, 'message' => $e->getMessage());
        }
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
    $repo = gh('GET', '/repos/' . $cfg['repo'], null, false, $token);
    if (empty($repo['permissions']['push'])) {
        fail('Token radi, ali nema dozvolu "Contents: Read and write" za ' . $cfg['repo'] . '.');
    }
    try {
        gh('GET', '/repos/' . $cfg['repo'] . '/actions/runs?per_page=1', null, false, $token);
    } catch (ApiError $e) {
        fail('Token nema dozvolu "Actions: Read-only" (potrebno za praćenje objave).');
    }
    save_config(array('github_token' => $token));
    audit('novi GitHub token');
    send_json(array('ok' => true));
}

fail('Nepoznata akcija.');
