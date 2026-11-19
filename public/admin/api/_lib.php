<?php
/**
 * Synthesis Pharma admin – zajednički kod (PHP 7.3 kompatibilno).
 *
 * Kako radi: admin ne mijenja fajlove sajta direktno. Izmjene (JSON/Markdown + nove slike) šalje kao
 * commit u GitHub repozitorij preko GitHub API-ja; GitHub Actions zatim builda statični sajt i
 * postavlja ga na server (FTP). Lozinka, GitHub token, sesije i keš su u admin/_data/ (nije u repou,
 * zaštićeno web.config-om + svaki osjetljivi fajl počinje sa "<?php exit; ?>").
 */

if (realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    http_response_code(404);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', '0');
date_default_timezone_set('Europe/Sarajevo');

define('DATA_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . '_data');
define('GUARD', "<?php http_response_code(404); exit; ?>\n");
define('DEFAULT_REPO', 'AdiZeljkovic/SynthesisPharm');
define('DEFAULT_BRANCH', 'main');
define('SESSION_IDLE', 7200);      // odjava nakon 2 h neaktivnosti
define('SESSION_MAX', 43200);      // najduže 12 h
define('CONTENT_PATH_RE', '#^src/content/(?:[a-z0-9-]+/)?[a-z0-9-]+\.(?:json|md)$#');
define('IMAGE_EXT_RE', '#\.(?:jpe?g|png|webp|gif)$#i');

class ApiError extends Exception
{
    public $status;
    public function __construct($message, $status = 400)
    {
        parent::__construct($message);
        $this->status = $status;
    }
}

class GhError extends ApiError
{
    public $data;
    public function __construct($message, $status, $data = null)
    {
        parent::__construct($message, $status);
        $this->data = $data;
    }
}

/* ───────────────────────── Odgovori ───────────────────────── */

function send_json($data, $status = 200)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail($message, $status = 400)
{
    throw new ApiError($message, $status);
}

set_exception_handler(function ($e) {
    if ($e instanceof ApiError) {
        if ($e instanceof GhError) {
            error_log('[admin] GitHub ' . $e->status . ': ' . $e->getMessage());
        }
        send_json(array('error' => $e->getMessage()), $e->status >= 400 ? $e->status : 502);
    }
    error_log('[admin] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    send_json(array('error' => 'Greška na serveru. Pokušajte ponovo.'), 500);
});

/* ───────────────────────── Fajlovi u _data ───────────────────────── */

function ensure_dir($dir)
{
    if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
        throw new Exception('Ne mogu napraviti folder ' . $dir);
    }
}

function ensure_data_dir()
{
    ensure_dir(DATA_DIR);
    // Druga linija zaštite (uz hiddenSegments u admin/web.config): IIS ne servira ništa iz _data
    $wc = DATA_DIR . '/web.config';
    if (!file_exists($wc)) {
        @file_put_contents($wc, "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<configuration>\n  <system.webServer>\n    <security>\n      <requestFiltering>\n        <fileExtensions allowUnlisted=\"false\" />\n      </requestFiltering>\n    </security>\n  </system.webServer>\n</configuration>\n");
    }
}

/** Atomski upis (temp + rename), da prekinut upis ne ošteti fajl. */
function write_file($path, $content)
{
    ensure_dir(dirname($path));
    $tmp = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, $content, LOCK_EX) === false) {
        throw new Exception('Upis nije uspio: ' . $path);
    }
    if (file_exists($path)) {
        @unlink($path); // Windows: rename ne prepisuje postojeći fajl
    }
    if (!@rename($tmp, $path)) {
        @unlink($tmp);
        throw new Exception('Upis nije uspio: ' . $path);
    }
}

/** JSON zaštićen PHP zaglavljem: ako ga neko otvori preko weba, PHP odmah izađe. */
function read_guarded($name, $default = array())
{
    $file = DATA_DIR . '/' . $name . '.php';
    if (!is_file($file)) {
        return $default;
    }
    $raw = file_get_contents($file);
    $pos = strpos($raw, "\n");
    $data = json_decode($pos === false ? '' : substr($raw, $pos + 1), true);
    return is_array($data) ? $data : $default;
}

function write_guarded($name, $data)
{
    ensure_data_dir();
    write_file(DATA_DIR . '/' . $name . '.php', GUARD . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

/* ───────────────────────── Konfiguracija ───────────────────────── */

function config()
{
    static $cfg = null;
    if ($cfg === null) {
        $cfg = read_guarded('config', array());
        $cfg += array(
            'password_hash' => '',
            'github_token' => '',
            'repo' => DEFAULT_REPO,
            'branch' => DEFAULT_BRANCH,
            'dev_origin' => '',
        );
    }
    return $cfg;
}

function save_config($changes)
{
    $cfg = array_merge(read_guarded('config', array()), $changes);
    write_guarded('config', $cfg);
}

function audit($event, $details = '')
{
    try {
        $log = read_guarded('log', array());
        array_unshift($log, array('t' => date('c'), 'ip' => client_ip(), 'e' => $event, 'd' => $details));
        write_guarded('log', array_slice($log, 0, 300));
    } catch (Exception $e) {
        error_log('[admin] audit: ' . $e->getMessage());
    }
}

function client_ip()
{
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
}

function is_https()
{
    return (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
}

/* ───────────────────────── Zahtjev, sesija, CSRF ───────────────────────── */

function method()
{
    return isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
}

function json_input()
{
    // Samo application/json: forma s drugog sajta ne može poslati takav zahtjev bez CORS dozvole
    $type = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    if (stripos($type, 'application/json') !== 0) {
        fail('Neispravan zahtjev.', 415);
    }
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return array();
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('Neispravan zahtjev.');
    }
    return $data;
}

function cors_for_dev()
{
    // Samo za lokalni razvoj (next dev na drugom portu); na serveru je dev_origin prazan.
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $dev = config()['dev_origin'];
    if ($dev !== '' && $origin === $dev) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Methods: GET, POST');
        header('Vary: Origin');
        if (method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

function start_session()
{
    ensure_data_dir();
    $dir = DATA_DIR . '/sessions';
    ensure_dir($dir);
    session_save_path($dir);
    session_name('sp_admin');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string) SESSION_MAX);
    session_set_cookie_params(array(
        'lifetime' => 0,
        'path' => '/admin/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => config()['dev_origin'] !== '' ? 'Lax' : 'Strict',
    ));
    session_start();
}

function is_authenticated()
{
    if (empty($_SESSION['auth'])) {
        return false;
    }
    $now = time();
    if ($now - $_SESSION['last'] > SESSION_IDLE || $now - $_SESSION['since'] > SESSION_MAX) {
        $_SESSION = array();
        return false;
    }
    $_SESSION['last'] = $now;
    return true;
}

function csrf_token()
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/** Svaki API fajl počinje ovim: sesija + (osim za prijavu) obavezna prijava i CSRF za POST. */
function bootstrap($requireAuth = true)
{
    cors_for_dev();
    start_session();
    if ($requireAuth && !is_authenticated()) {
        fail('Niste prijavljeni.', 401);
    }
    if ($requireAuth && method() === 'GET') {
        // Čitanje ne mijenja sesiju – otključaj je da se paralelni zahtjevi (pregledi slika) ne čekaju
        session_write_close();
    }
    if (method() === 'POST' && ($requireAuth || is_authenticated())) {
        $sent = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : '';
        if (!$requireAuth && empty($_SESSION['csrf'])) {
            return; // prijava: token još ne postoji
        }
        if (!is_string($sent) || !hash_equals(csrf_token(), $sent)) {
            fail('Sigurnosni token je istekao. Osvježite stranicu.', 403);
        }
    }
}

/* ───────────────────────── Ograničenje pokušaja prijave ───────────────────────── */

function login_locked()
{
    $rl = read_guarded('ratelimit', array());
    $ip = client_ip();
    $now = time();
    if (isset($rl['ip'][$ip]['until']) && $rl['ip'][$ip]['until'] > $now) {
        return $rl['ip'][$ip]['until'] - $now;
    }
    if (isset($rl['global']['until']) && $rl['global']['until'] > $now) {
        return $rl['global']['until'] - $now;
    }
    return 0;
}

function login_failed()
{
    $rl = read_guarded('ratelimit', array());
    $ip = client_ip();
    $now = time();
    $entry = isset($rl['ip'][$ip]) ? $rl['ip'][$ip] : array('fails' => 0, 'first' => $now, 'until' => 0);
    if ($now - $entry['first'] > 900) {
        $entry = array('fails' => 0, 'first' => $now, 'until' => 0);
    }
    $entry['fails']++;
    if ($entry['fails'] >= 5) {
        $entry['until'] = $now + 900;
        $entry['fails'] = 0;
        $entry['first'] = $now;
    }
    $rl['ip'][$ip] = $entry;
    // Zaštita od napada sa više adresa: 25 pogrešnih unosa na sat → zaključaj prijavu na 15 min
    $g = isset($rl['global']) ? $rl['global'] : array('fails' => 0, 'first' => $now, 'until' => 0);
    if ($now - $g['first'] > 3600) {
        $g = array('fails' => 0, 'first' => $now, 'until' => 0);
    }
    $g['fails']++;
    if ($g['fails'] >= 25) {
        $g = array('fails' => 0, 'first' => $now, 'until' => $now + 900);
    }
    $rl['global'] = $g;
    foreach ($rl['ip'] as $k => $v) {
        if ($v['until'] < $now && $now - $v['first'] > 3600) {
            unset($rl['ip'][$k]);
        }
    }
    write_guarded('ratelimit', $rl);
}

function login_succeeded()
{
    $rl = read_guarded('ratelimit', array());
    unset($rl['ip'][client_ip()]);
    write_guarded('ratelimit', $rl);
}

/* ───────────────────────── GitHub API ───────────────────────── */

function gh_headers($accept, $token = null)
{
    $token = $token === null ? config()['github_token'] : $token;
    $h = array(
        'Accept: ' . $accept,
        'User-Agent: SynthesisPharma-Admin',
        'X-GitHub-Api-Version: 2022-11-28',
    );
    if ($token !== '') {
        $h[] = 'Authorization: Bearer ' . $token;
    }
    return $h;
}

function gh_error_message($status, $data)
{
    $msg = is_array($data) && isset($data['message']) ? $data['message'] : '';
    if ($status === 401) {
        return 'GitHub token nije ispravan ili je istekao. Postavite novi u Postavkama.';
    }
    if ($status === 403 && stripos($msg, 'rate limit') !== false) {
        return 'GitHub privremeno ograničava broj zahtjeva. Pokušajte za nekoliko minuta.';
    }
    if ($status === 403 || ($status === 404 && config()['github_token'] !== '')) {
        return 'GitHub token nema potrebne dozvole za repozitorij (' . $msg . ').';
    }
    return 'GitHub greška ' . $status . ($msg !== '' ? ': ' . $msg : '');
}

/**
 * Poziv GitHub API-ja. $raw = true vraća sirove bajtove (za slike).
 */
function gh($method, $path, $body = null, $raw = false, $token = null)
{
    $url = strpos($path, 'https://') === 0 ? $path : 'https://api.github.com' . $path;
    $ch = curl_init($url);
    $headers = gh_headers($raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', $token);
    $opts = array(
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
    );
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        $opts[CURLOPT_POSTFIELDS] = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
    $opts[CURLOPT_HTTPHEADER] = $headers;
    curl_setopt_array($ch, $opts);
    $res = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($res === false) {
        throw new GhError('Veza s GitHubom nije uspjela (' . $err . ').', 502);
    }
    if ($status >= 400) {
        $data = json_decode($res, true);
        throw new GhError(gh_error_message($status, $data), $status === 401 || $status === 403 ? 502 : $status, $data);
    }
    return $raw ? $res : json_decode($res, true);
}

/** Više GET zahtjeva paralelno (npr. svi blog tekstovi). Vraća niz u istom redoslijedu (null za grešku). */
function gh_many($paths)
{
    $mh = curl_multi_init();
    $handles = array();
    foreach ($paths as $i => $path) {
        $ch = curl_init('https://api.github.com' . $path);
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER => gh_headers('application/vnd.github+json'),
        ));
        curl_multi_add_handle($mh, $ch);
        $handles[$i] = $ch;
    }
    do {
        $st = curl_multi_exec($mh, $running);
        if ($running) {
            curl_multi_select($mh, 1.0);
        }
    } while ($running && $st === CURLM_OK);
    $out = array();
    foreach ($handles as $i => $ch) {
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $body = curl_multi_getcontent($ch);
        $out[$i] = $code >= 200 && $code < 300 ? json_decode($body, true) : null;
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }
    curl_multi_close($mh);
    return $out;
}

function repo_path($path)
{
    // GitHub contents API: segmenti se kodiraju, "/" ostaje
    return implode('/', array_map('rawurlencode', explode('/', $path)));
}

function require_token()
{
    if (config()['github_token'] === '') {
        fail('GitHub token nije postavljen. Otvorite Postavke i unesite token.', 409);
    }
}

/** Git SHA-1 bloba (isti kao što ga računa git), za vraćanje novih verzija klijentu. */
function git_blob_sha($content)
{
    return sha1('blob ' . strlen($content) . "\0" . $content);
}

function gh_file($path)
{
    $cfg = config();
    $f = gh('GET', '/repos/' . $cfg['repo'] . '/contents/' . repo_path($path) . '?ref=' . rawurlencode($cfg['branch']));
    if (!is_array($f) || !isset($f['type']) || $f['type'] !== 'file') {
        fail('Fajl nije pronađen: ' . $path, 404);
    }
    return array('path' => $path, 'sha' => $f['sha'], 'content' => base64_decode($f['content']));
}

/** Trenutni SHA fajla na grani (null ako ne postoji). */
function gh_file_sha($path)
{
    $cfg = config();
    try {
        $f = gh('GET', '/repos/' . $cfg['repo'] . '/contents/' . repo_path($path) . '?ref=' . rawurlencode($cfg['branch']));
        return isset($f['sha']) ? $f['sha'] : null;
    } catch (GhError $e) {
        if ($e->status === 404) {
            return null;
        }
        throw $e;
    }
}

/**
 * Jedan commit sa više fajlova: $files = [[path, content(bajtovi)]], $deletes = [path].
 * Tekst ide direktno u tree, binarni fajlovi kao blobovi. Ako se grana u međuvremenu pomjeri, pokušava ponovo.
 */
function gh_commit($files, $deletes, $message)
{
    $cfg = config();
    $repo = '/repos/' . $cfg['repo'];
    $entries = array();
    foreach ($files as $f) {
        if (preg_match('#\.(json|md|txt)$#', $f['path'])) {
            $entries[] = array('path' => $f['path'], 'mode' => '100644', 'type' => 'blob', 'content' => $f['content']);
        } else {
            $blob = gh('POST', $repo . '/git/blobs', array('content' => base64_encode($f['content']), 'encoding' => 'base64'));
            $entries[] = array('path' => $f['path'], 'mode' => '100644', 'type' => 'blob', 'sha' => $blob['sha']);
        }
    }
    foreach ($deletes as $p) {
        $entries[] = array('path' => $p, 'mode' => '100644', 'type' => 'blob', 'sha' => null);
    }
    if (count($entries) === 0) {
        fail('Nema izmjena za objavu.');
    }
    for ($attempt = 0; $attempt < 3; $attempt++) {
        $ref = gh('GET', $repo . '/git/ref/heads/' . rawurlencode($cfg['branch']));
        $head = $ref['object']['sha'];
        $commit = gh('GET', $repo . '/git/commits/' . $head);
        $tree = gh('POST', $repo . '/git/trees', array('base_tree' => $commit['tree']['sha'], 'tree' => $entries));
        $new = gh('POST', $repo . '/git/commits', array(
            'message' => $message,
            'tree' => $tree['sha'],
            'parents' => array($head),
            'author' => array('name' => 'Admin panel', 'email' => 'admin@synthesispharma.ba', 'date' => date('c')),
        ));
        try {
            gh('PATCH', $repo . '/git/refs/heads/' . rawurlencode($cfg['branch']), array('sha' => $new['sha'], 'force' => false));
            return $new['sha'];
        } catch (GhError $e) {
            if ($e->status !== 422) {
                throw $e;
            }
            // Neko je u međuvremenu dodao commit – ponovi na novom vrhu grane
        }
    }
    fail('Objava nije uspjela jer se repozitorij istovremeno mijenjao. Pokušajte ponovo.', 409);
}

/* ───────────────────────── Slike koje čekaju objavu ───────────────────────── */

function pending_dir()
{
    return DATA_DIR . '/pending';
}

/** Sve slike otpremljene u adminu koje još nisu u repozitoriju: [repoPath => localFile] */
function pending_uploads()
{
    $root = pending_dir();
    $out = array();
    if (!is_dir($root)) {
        return $out;
    }
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        if ($file->isFile() && preg_match(IMAGE_EXT_RE, $file->getFilename())) {
            $rel = str_replace('\\', '/', substr($file->getPathname(), strlen($root) + 1));
            $out[$rel] = $file->getPathname();
        }
    }
    ksort($out);
    return $out;
}

function cache_dir()
{
    return DATA_DIR . '/cache';
}
