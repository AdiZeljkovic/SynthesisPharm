<?php
/**
 * Stanje objava (GitHub Actions).
 *   GET → { runs: [{ id, status, conclusion, title, created, updated, url, commit, deploy }] }
 *   deploy (samo za najnoviji): "uspjeh" | "preskočeno" | "greška" | null (još traje)
 */
require __DIR__ . '/_lib.php';

bootstrap(true);
require_token();
$cfg = config();

$res = gh('GET', '/repos/' . $cfg['repo'] . '/actions/runs?branch=' . rawurlencode($cfg['branch']) . '&per_page=8');
$runs = array();
foreach ($res['workflow_runs'] as $i => $r) {
    $run = array(
        'id' => $r['id'],
        'status' => $r['status'],          // queued | in_progress | completed
        'conclusion' => $r['conclusion'],  // success | failure | cancelled | null
        'title' => $r['display_title'],
        'created' => $r['created_at'],
        'updated' => $r['updated_at'],
        'url' => $r['html_url'],
        'commit' => $r['head_sha'],
        'deploy' => null,
    );
    if ($i === 0 && $r['status'] === 'completed') {
        try {
            $jobs = gh('GET', '/repos/' . $cfg['repo'] . '/actions/runs/' . $r['id'] . '/jobs');
            foreach ($jobs['jobs'] as $job) {
                foreach ($job['steps'] as $step) {
                    if (stripos($step['name'], 'Objava na server') === 0) {
                        $c = $step['conclusion'];
                        $run['deploy'] = $c === 'success' ? 'uspjeh' : ($c === 'skipped' ? 'preskočeno' : 'greška');
                    }
                }
            }
        } catch (GhError $e) {
            // detalji nisu ključni
        }
    }
    $runs[] = $run;
}
send_json(array('runs' => $runs));
