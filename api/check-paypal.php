<?php
require_once __DIR__ . '/paypal-functions.php';
$checks = [
    'php_version' => PHP_VERSION,
    'curl_loaded' => extension_loaded('curl'),
    'mode' => PAYPAL_MODE,
    'currency' => PAYPAL_CURRENCY,
    'client_id_set' => PAYPAL_CLIENT_ID !== '' && PAYPAL_CLIENT_ID !== 'HIER_CLIENT_ID_EINTRAGEN',
    'secret_set' => PAYPAL_CLIENT_SECRET !== '' && PAYPAL_CLIENT_SECRET !== 'HIER_NEUEN_SECRET_EINTRAGEN',
];
try {
    $token = paypal_access_token();
    $checks['paypal_auth'] = 'OK';
    $checks['token_preview'] = substr($token, 0, 12) . '...';
    json_response($checks);
} catch (Throwable $e) {
    $checks['paypal_auth'] = 'FEHLER';
    $checks['error'] = $e->getMessage();
    json_response($checks, 500);
}
