<?php
/**
 * Prijava / odjava / stanje sesije.
 *   GET                       → { authenticated, csrf, tokenSet, repo }
 *   POST {action:"login", password}
 *   POST {action:"logout"}
 */
require __DIR__ . '/_lib.php';

bootstrap(false);
$cfg = config();

if (method() === 'GET') {
    $auth = is_authenticated();
    send_json(array(
        'authenticated' => $auth,
        'configured' => $cfg['password_hash'] !== '',
        'csrf' => csrf_token(),
        'tokenSet' => $auth ? $cfg['github_token'] !== '' : null,
        'repo' => $auth ? $cfg['repo'] : null,
        'branch' => $auth ? $cfg['branch'] : null,
    ));
}

if (method() !== 'POST') {
    fail('Metoda nije dozvoljena.', 405);
}

$in = json_input();
$action = isset($in['action']) ? $in['action'] : '';

if ($action === 'logout') {
    if (is_authenticated()) {
        $sent = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : '';
        if (!hash_equals(csrf_token(), (string) $sent)) {
            fail('Sigurnosni token je istekao. Osvježite stranicu.', 403);
        }
        audit('odjava');
    }
    $_SESSION = array();
    session_regenerate_id(true);
    send_json(array('ok' => true));
}

if ($action === 'login') {
    if ($cfg['password_hash'] === '') {
        fail('Admin još nije podešen (nema lozinke na serveru).', 503);
    }
    $wait = login_attempt();
    if ($wait > 0) {
        fail('Previše neuspjelih pokušaja. Pokušajte ponovo za ' . max(1, (int) ceil($wait / 60)) . ' min.', 429);
    }
    $password = isset($in['password']) ? (string) $in['password'] : '';
    usleep(300000); // usporava pogađanje
    if ($password === '' || strlen($password) > 200 || !password_verify($password, $cfg['password_hash'])) {
        audit('neuspjela prijava');
        fail('Pogrešna lozinka.', 401);
    }
    login_succeeded();
    if (password_needs_rehash($cfg['password_hash'], PASSWORD_DEFAULT)) {
        save_config(array('password_hash' => password_hash($password, PASSWORD_DEFAULT)));
    }
    session_regenerate_id(true);
    $_SESSION = array('auth' => true, 'since' => time(), 'last' => time());
    unset($_SESSION['csrf']);
    audit('prijava');
    send_json(array(
        'authenticated' => true,
        'csrf' => csrf_token(),
        'tokenSet' => $cfg['github_token'] !== '',
        'repo' => $cfg['repo'],
        'branch' => $cfg['branch'],
    ));
}

fail('Nepoznata akcija.');
