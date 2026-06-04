FLAG SERIES PayPal Integration für STRATO Hosting Plus

WICHTIG:
Der PayPal Client Secret wurde im Chat geteilt. Erzeuge im PayPal Developer Dashboard einen neuen Secret und verwende nur den neuen Secret.

Upload auf STRATO:
1. Den Inhalt dieses Ordners in dein Webspace-Verzeichnis hochladen, z.B. /htdocs/flagseries oder direkt /htdocs.
2. In /api/paypal-config.php den Platzhalter ersetzen:
   PAYPAL_CLIENT_SECRET = 'HIER_NEUEN_PAYPAL_SECRET_EINTRAGEN';
3. Prüfen, dass PHP cURL bei STRATO aktiv ist. Normalerweise ist das bei Hosting Plus vorhanden.
4. Seite über https://flagseries.de öffnen.
5. PayPal Button testen.

Warum PHP?
STRATO Hosting Plus ist klassischer Webspace. Deshalb nutzt diese Version PHP-Endpunkte:
- api/create-paypal-order.php
- api/capture-paypal-order.php

Diese Dateien sprechen serverseitig mit PayPal. Der Secret steht dadurch nicht in HTML oder JavaScript.

Preise:
- 1 Box = 39,00 EUR inkl. 19% MwSt.
- ab 10 Boxen = 10% Rabatt

Bestellungen:
Erfolgreiche PayPal-Zahlungen werden zusätzlich gespeichert in:
/orders/paypal-orders.csv
Der Ordner ist per .htaccess gesperrt.

Wenn ein Fehler erscheint:
- Prüfe, ob in paypal-config.php ein NEUER Secret eingetragen ist.
- Prüfe, ob Client ID und Secret beide LIVE oder beide SANDBOX sind.
- Prüfe, ob die Website über HTTPS läuft.
