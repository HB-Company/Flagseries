<?php
require_once __DIR__ . '/paypal-functions.php';
$order = order_from_request(read_json());
$payload = [
    'intent' => 'CAPTURE',
    'purchase_units' => [[
        'reference_id' => 'FLAGSERIES-' . strtoupper($order['variant']),
        'description' => 'FLAG SERIES Feuerzeuge - ' . $order['product']['name'] . ' - ' . $order['qty'] . ' Box(en)',
        'amount' => [
            'currency_code' => PAYPAL_CURRENCY,
            'value' => $order['total'],
            'breakdown' => [
                'item_total' => ['currency_code' => PAYPAL_CURRENCY, 'value' => $order['subtotal']],
                'discount' => ['currency_code' => PAYPAL_CURRENCY, 'value' => $order['discount']],
            ],
        ],
        'items' => [[
            'name' => 'FLAG SERIES ' . $order['product']['name'],
            'sku' => $order['product']['sku'],
            'unit_amount' => ['currency_code' => PAYPAL_CURRENCY, 'value' => $order['unit']],
            'quantity' => (string)$order['qty'],
            'category' => 'PHYSICAL_GOODS',
        ]],
    ]],
    'application_context' => [
        'brand_name' => 'FLAG SERIES',
        'shipping_preference' => 'GET_FROM_FILE',
        'user_action' => 'PAY_NOW',
    ],
];
$result = paypal_request('POST', '/v2/checkout/orders', $payload);
json_response(['id' => $result['id'] ?? null, 'status' => $result['status'] ?? null]);
