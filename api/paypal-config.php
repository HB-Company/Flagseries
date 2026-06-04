<?php
// FLAG SERIES PayPal Live-Konfiguration für STRATO Hosting Plus / PHP
// WICHTIG: Der Client Secret darf NIEMALS in HTML, JavaScript oder GitHub stehen.
// Nach dem versehentlichen Teilen bitte eine neue PayPal App erstellen oder den Secret regenerieren.

const PAYPAL_MODE = 'live'; // live = echte Zahlungen, sandbox = Testmodus
const PAYPAL_CLIENT_ID = 'ARLJa6vHZIygg8-TBCuQFKgeX3xj4HOI_p_JlcBIa9rQgpNofpo72BFAbbcUQ9bGHe8-4D7yItnsuW8Z';
const PAYPAL_CLIENT_SECRET = 'EAtopJRd-dZHRJ8kKIO_4p8OmZ9Tv-nuZu8btNiBUjM_NJmGWsptjj6AX766cEwD-rOn2Uwx7rxRidSI';
const PAYPAL_CURRENCY = 'EUR';

function paypal_base_url(): string {
    return PAYPAL_MODE === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
}
