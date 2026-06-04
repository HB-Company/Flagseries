<?php
require_once __DIR__ . '/paypal-config.php';

function json_response(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function product_map(): array {
    return [
        'germany' => ['name' => 'Germany Box', 'country' => 'Deutschland', 'sku' => 'FS-GER'],
        'spain' => ['name' => 'Spanien Box', 'country' => 'Spanien', 'sku' => 'FS-ESP'],
        'turkey' => ['name' => 'Türkei Box', 'country' => 'Türkei', 'sku' => 'FS-TUR'],
        'brazil' => ['name' => 'Brazil Box', 'country' => 'Brasilien', 'sku' => 'FS-BRA'],
        'morocco' => ['name' => 'Marokko Box', 'country' => 'Marokko', 'sku' => 'FS-MAR'],
    ];
}

function order_from_request(array $data): array {
    $products = product_map();
    $variant = isset($data['variant']) ? preg_replace('/[^a-z]/', '', strtolower((string)$data['variant'])) : 'germany';
    if (!isset($products[$variant])) {
        json_response(['error' => 'Ungültige Produktvariante.'], 400);
    }
    $qty = (int)($data['qty'] ?? 1);
    if ($qty < 1 || $qty > 500) {
        json_response(['error' => 'Ungültige Menge.'], 400);
    }
    $unit = 39.00;
    $subtotal = $unit * $qty;
    $discount = $qty >= 10 ? $subtotal * 0.10 : 0.00;
    $total = $subtotal - $discount;

    return [
        'variant' => $variant,
        'product' => $products[$variant],
        'qty' => $qty,
        'unit' => number_format($unit, 2, '.', ''),
        'subtotal' => number_format($subtotal, 2, '.', ''),
        'discount' => number_format($discount, 2, '.', ''),
        'total' => number_format($total, 2, '.', ''),
    ];
}

function paypal_access_token(): string {
    if (!extension_loaded('curl')) {
        json_response(['error' => 'PHP-cURL ist auf dem Server nicht aktiv. Bitte bei STRATO PHP/cURL aktivieren oder Support kontaktieren.'], 500);
    }
    if (PAYPAL_CLIENT_SECRET === 'HIER_NEUEN_SECRET_EINTRAGEN' || PAYPAL_CLIENT_SECRET === 'HIER_NEUEN_PAYPAL_SECRET_EINTRAGEN' || PAYPAL_CLIENT_SECRET === '') {
        json_response(['error' => 'PayPal Secret fehlt in api/paypal-config.php. Bitte neuen Secret eintragen.'], 500);
    }
    $ch = curl_init(paypal_base_url() . '/v1/oauth2/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_USERPWD => PAYPAL_CLIENT_ID . ':' . PAYPAL_CLIENT_SECRET,
        CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'Accept-Language: de_DE'],
        CURLOPT_TIMEOUT => 30,
    ]);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($response === false || $status >= 400) {
        json_response(['error' => 'PayPal Authentifizierung fehlgeschlagen. Prüfe Client ID, neuen Secret und Live/Sandbox-Modus.', 'status' => $status, 'detail' => $json ?? $err], 500);
    }
    $json = json_decode($response, true);
    if (!isset($json['access_token'])) {
        json_response(['error' => 'Kein PayPal Access Token erhalten.'], 500);
    }
    return $json['access_token'];
}

function paypal_request(string $method, string $path, array $payload = null): array {
    $token = paypal_access_token();
    $ch = curl_init(paypal_base_url() . $path);
    $headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
    ];
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 30,
    ]);
    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    $json = json_decode($response ?: '{}', true);
    if ($response === false || $status >= 400) {
        json_response(['error' => 'PayPal API Fehler.', 'status' => $status, 'detail' => $json ?: $err], 500);
    }
    return is_array($json) ? $json : [];
}
