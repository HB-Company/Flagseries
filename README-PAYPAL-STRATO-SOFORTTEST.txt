FLAG SERIES - PayPal STRATO Soforttest

1) Alles aus diesem ZIP direkt in das Zielverzeichnis deiner Domain hochladen.
   index.html muss im gleichen Ordner liegen wie css/, js/, api/, assets/, legal/.

2) Datei öffnen:
   api/paypal-config.php

3) Eintragen:
   PAYPAL_CLIENT_SECRET = 'DEIN_NEUER_SECRET';

4) Im Browser testen:
   https://flagseries.de/api/check-paypal.php

   Wenn dort "paypal_auth":"OK" steht, ist die Server-Verbindung zu PayPal richtig.
   Wenn dort ein Fehler steht, ist genau diese Meldung die Ursache.

5) Danach öffnen:
   https://flagseries.de

6) Lokal per Doppelklick funktioniert echte PayPal-Zahlung NICHT,
   weil PHP-Endpunkte lokal nicht ausgeführt werden. Lokal braucht man XAMPP/MAMP oder einen PHP-Server.

7) Wichtig:
   Der Käufer darf nicht mit demselben PayPal-Konto zahlen, das Geld empfängt.
   Teste live mit einem anderen PayPal-Konto.
