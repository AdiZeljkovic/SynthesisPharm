<?php
/**
 * Kontakt forma – Synthesis Pharma (statični sajt na Windows Plesk / IIS).
 * Kompatibilno sa PHP 7.3 (bez arrow funkcija, match, str_contains, typed properties…).
 *
 * Prima POST (application/x-www-form-urlencoded ili multipart) i vraća JSON:
 *   { "status": "success" | "error", "message": "...", "errors": { "polje": "poruka" } }
 *
 * Šalje preko PHP mail() – na Plesku je SMTP za domenu već podešen.
 */

declare(strict_types=1);

const RECIPIENT = 'info@synthesispharma.ba';
const FROM_ADDRESS = 'web@synthesispharma.ba';   // adresa sa domene (inače mail završi u spamu)
const RATE_LIMIT = 5;                            // najviše poruka…
const RATE_WINDOW = 600;                         // …u 10 minuta po IP adresi

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $code, array $body)
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $key, int $max): string
{
    $value = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max, 'UTF-8');
    }
    return substr($value, 0, $max);
}

/** Uklanja nove redove (sprječava ubacivanje dodatnih email headera). */
function oneLine(string $value): string
{
    return trim(str_replace(array("\r", "\n", "%0a", "%0d"), ' ', $value));
}

function encodeHeader(string $value): string
{
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, array('status' => 'error', 'message' => 'Dozvoljen je samo POST.'));
}

// Honeypot – botovi popune skriveno polje; odgovaramo "uspjeh" da ne pokušavaju ponovo
if (field('website', 200) !== '') {
    respond(200, array('status' => 'success', 'message' => 'Hvala! Vaša poruka je poslana.'));
}

$values = array(
    'name' => oneLine(field('name', 120)),
    'email' => oneLine(field('email', 200)),
    'phone' => oneLine(field('phone', 40)),
    'subject' => oneLine(field('subject', 200)),
    'message' => field('message', 5000),
);

$errors = array();
if ((function_exists('mb_strlen') ? mb_strlen($values['name'], 'UTF-8') : strlen($values['name'])) < 2) {
    $errors['name'] = 'Unesite ime i prezime.';
}
if (!filter_var($values['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Unesite ispravnu email adresu.';
}
if ((function_exists('mb_strlen') ? mb_strlen($values['message'], 'UTF-8') : strlen($values['message'])) < 10) {
    $errors['message'] = 'Poruka treba imati barem 10 znakova.';
}
if ($errors) {
    respond(422, array('status' => 'error', 'message' => 'Molimo ispravite označena polja.', 'errors' => $errors));
}

// Ograničenje broja poruka po IP adresi (fajl u temp folderu servera)
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
$rateFile = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'sp_contact_' . hash('sha256', $ip) . '.json';
$now = time();
$hits = array();
if (is_file($rateFile)) {
    $decoded = json_decode((string) @file_get_contents($rateFile), true);
    if (is_array($decoded)) {
        foreach ($decoded as $t) {
            if (is_int($t) && $t > $now - RATE_WINDOW) {
                $hits[] = $t;
            }
        }
    }
}
if (count($hits) >= RATE_LIMIT) {
    respond(429, array('status' => 'error', 'message' => 'Previše poruka u kratkom vremenu. Pokušajte ponovo za nekoliko minuta ili pišite na ' . RECIPIENT . '.'));
}
$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

$subject = '[Web] ' . ($values['subject'] !== '' ? $values['subject'] : 'Nova poruka s web stranice');
$body = implode("\r\n", array(
    'Ime i prezime: ' . $values['name'],
    'Email: ' . $values['email'],
    'Telefon: ' . ($values['phone'] !== '' ? $values['phone'] : '—'),
    'Naslov: ' . ($values['subject'] !== '' ? $values['subject'] : '—'),
    '',
    str_replace(array("\r\n", "\r"), "\n", $values['message']),
));
$headers = implode("\r\n", array(
    'From: ' . encodeHeader('Synthesis Pharma web') . ' <' . FROM_ADDRESS . '>',
    'Reply-To: ' . encodeHeader($values['name']) . ' <' . $values['email'] . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: SynthesisPharma-Web',
));

$sent = @mail(RECIPIENT, encodeHeader($subject), $body, $headers);

if (!$sent) {
    error_log('[kontakt] mail() nije uspio za poruku od ' . $values['email']);
    respond(500, array(
        'status' => 'error',
        'message' => 'Došlo je do greške pri slanju. Pokušajte ponovo ili pišite na ' . RECIPIENT . '.',
    ));
}

respond(200, array('status' => 'success', 'message' => 'Hvala! Vaša poruka je poslana – javit ćemo vam se uskoro.'));
