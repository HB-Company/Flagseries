FLAG SERIES PayPal Sofort-Version

Diese Version funktioniert ohne PHP-Backend auf STRATO Webspace und auch auf GitHub Pages.
Sie nutzt die PayPal JavaScript SDK direkt mit deiner LIVE Client-ID.

WICHTIG:
- Client-ID ist öffentlich okay.
- Client Secret wurde NICHT eingebaut und darf niemals in GitHub/HTML/JS stehen.
- Diese einfache Version ist zum Sofort-Testen gedacht. Für maximale Sicherheit später wieder PHP-Backend nutzen.

Hochladen:
1. Alles aus diesem Ordner in den Webspace laden.
2. index.html muss direkt im Hauptordner liegen.
3. css/, js/, assets/ und legal/ müssen daneben liegen.
4. Im Browser Cache leeren oder im Inkognito-Fenster testen.

Wenn der PayPal Button nicht erscheint:
- Werbeblocker ausschalten
- prüfen, dass die Seite mit https:// geladen wird
- Browser-Konsole öffnen (F12 -> Console)
