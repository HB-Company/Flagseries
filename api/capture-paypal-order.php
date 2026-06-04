<?php
require_once __DIR__ . '/paypal-functions.php';
$data = read_json();
$order = order_from_request($data);
$orderID = isset($data['orderID']) ? preg_replace('/[^A-Z0-9]/', '', strtoupper((string)$data['orderID'])) : '';
if ($orderID === '') {
    json_response(['error' => 'PayPal Order-ID fehlt.'], 400);
}
$result = paypal_request('POST', '/v2/checkout/orders/' . rawurlencode($orderID) . '/capture', new stdClass());
$status = $result['status'] ?? '';
$capture = $result['purchase_units'][0]['payments']['captures'][0] ?? [];
$transactionId = $capture['id'] ?? '';
$captureStatus = $capture['status'] ?? '';
$paidAmount = $capture['amount']['value'] ?? '';

if ($status !== 'COMPLETED' && $captureStatus !== 'COMPLETED') {
    json_response(['error' => 'PayPal Zahlung wurde nicht abgeschlossen.', 'paypal_status' => $status ?: $captureStatus], 400);
}
if ($paidAmount !== '' && abs((float)$paidAmount - (float)$order['total']) > 0.01) {
    json_response(['error' => 'PayPal Betrag stimmt nicht mit dem Warenkorb überein.'], 400);
}

$ordersDir = dirname(__DIR__) . '/orders';
if (!is_dir($ordersDir)) { @mkdir($ordersDir, 0755, true); }
$csv = $ordersDir . '/paypal-orders.csv';
$isNew = !file_exists($csv);
$fh = @fopen($csv, 'a');
if ($fh) {
    if ($isNew) fputcsv($fh, ['date','paypal_order_id','transaction_id','variant','qty','total','payer_email','payer_name']);
    $payer = $result['payer'] ?? [];
    $payerName = trim(($payer['name']['given_name'] ?? '') . ' ' . ($payer['name']['surname'] ?? ''));
    fputcsv($fh, [date('c'), $orderID, $transactionId, $order['product']['name'], $order['qty'], $order['total'], $payer['email_address'] ?? '', $payerName]);
    fclose($fh);
}
json_response(['status' => 'COMPLETED', 'transaction_id' => $transactionId, 'total' => $order['total']]);
