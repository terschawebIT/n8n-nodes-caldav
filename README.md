# n8n-nodes-nextcloud-calendar

Dieses Repository enthält einen n8n-Knoten zur Integration mit Nextcloud Calendar über die CalDAV-API.

## Installation

Navigieren Sie zu Ihrem n8n-Installationsverzeichnis und führen Sie folgenden Befehl aus:

```bash
npm install n8n-nodes-nextcloud-calendar
```

Alternativ können Sie das Paket auch über die n8n-Weboberfläche im Community-Knoten-Bereich installieren.

## Voraussetzungen

- Eine funktionierende Nextcloud-Installation
- Eine n8n-Instanz (Version 1.0.0 oder höher)
- Gültige Nextcloud-Anmeldedaten (Benutzername und Passwort oder App-Passwort)

## Funktionen

Der Nextcloud Calendar-Knoten ermöglicht folgende Operationen:

### Kalender-Operationen

- **Kalender erstellen**: Erstellt einen neuen Kalender in Nextcloud
- **Kalender löschen**: Löscht einen bestehenden Kalender
- **Alle Kalender abrufen**: Listet alle verfügbaren Kalender auf

### Termin-Operationen

- **Termin erstellen**: Erstellt einen neuen Termin in einem ausgewählten Kalender
- **Termin ändern**: Aktualisiert einen bestehenden Termin
- **Termin löschen**: Löscht einen bestehenden Termin
- **Termin anzeigen**: Zeigt Details eines bestimmten Termins an
- **Termine anzeigen**: Listet alle Termine in einem bestimmten Zeitraum auf
- **Nächste Termine anzeigen**: Zeigt anstehende Termine an

## Konfiguration

### Anmeldedaten einrichten

1. Erstellen Sie ein neues Credential vom Typ "Nextcloud Calendar API"
2. Geben Sie Ihre Nextcloud-Server-URL, Benutzername und Passwort ein
   - Falls Sie Multi-Faktor-Authentifizierung verwenden, erstellen Sie ein App-Passwort in Ihren Nextcloud-Sicherheitseinstellungen

### Kalender-Operationen

Wählen Sie "Nextcloud Calendar" als Knoten und "Calendar" als Ressource. Dann stehen Ihnen folgende Operationen zur Verfügung:

- **Create**: Erstellt einen neuen Kalender. Parameter:
  - Name (erforderlich)
  - Zusätzliche Felder (optional):
    - Beschreibung
    - Farbe
    - Zeitzone

- **Delete**: Löscht einen Kalender. Parameter:
  - Kalender Name (erforderlich)

- **Get All**: Ruft alle verfügbaren Kalender ab. Keine zusätzlichen Parameter erforderlich.

### Termin-Operationen

Wählen Sie "Nextcloud Calendar" als Knoten und "Event" als Ressource. Dann stehen Ihnen folgende Operationen zur Verfügung:

- **Create**: Erstellt einen neuen Termin. Parameter:
  - Kalender Name (erforderlich)
  - Titel (erforderlich)
  - Start (erforderlich)
  - Ende (erforderlich)
  - Zusätzliche Felder (optional):
    - Beschreibung
    - Ort
    - Teilnehmer hinzufügen (E-Mail, Anzeigename, Rolle, RSVP)
  - Nextcloud-Einstellungen:
    - Benachrichtigungen aktivieren
    - Einladungen senden
    - Alarm-Typ erzwingen

- **Update**: Aktualisiert einen bestehenden Termin. Parameter:
  - Kalender Name (erforderlich)
  - Termin ID (erforderlich)
  - Aktualisierungsfelder (optional):
    - Titel
    - Start
    - Ende
    - Beschreibung
    - Ort

- **Delete**: Löscht einen Termin. Parameter:
  - Kalender Name (erforderlich)
  - Termin ID (erforderlich)

- **Get**: Ruft einen bestimmten Termin ab. Parameter:
  - Kalender Name (erforderlich)
  - Termin ID (erforderlich)

- **Get All**: Listet alle Termine in einem Zeitraum auf. Parameter:
  - Kalender Name (erforderlich)
  - Start (erforderlich)
  - Ende (erforderlich)

- **Next Events**: Listet die nächsten anstehenden Termine auf. Parameter:
  - Kalender Name (erforderlich)
  - Maximale Anzahl (optional)

## Teilnehmer und Einladungen

Um Teilnehmer zu einem Termin hinzuzufügen:

1. Wählen Sie bei der Erstellung eines Termins "Zusätzliche Felder" aus
2. Aktivieren Sie "Teilnehmer hinzufügen"
3. Fügen Sie Teilnehmer mit folgenden Details hinzu:
   - E-Mail (erforderlich)
   - Anzeigename (optional)
   - Rolle (optional): Erforderlicher Teilnehmer, Optionaler Teilnehmer oder Moderator
   - RSVP (optional): Antwortoption aktivieren/deaktivieren

Damit Einladungen per E-Mail versendet werden:

1. Stellen Sie sicher, dass in Ihrer Nextcloud-Instanz ein E-Mail-Server konfiguriert ist
2. Aktivieren Sie in den Nextcloud-Admin-Einstellungen unter "Groupware" die Option "Send invitations to attendees"
3. Aktivieren Sie beim Erstellen des Termins in n8n unter "Nextcloud-Einstellungen" die Option "Einladungen senden"

## Verbessertes Ausgabeformat

Dieser Knoten liefert strukturierte Ausgabedaten mit folgenden Informationen:

- `success`: Boolean-Wert, der angibt, ob die Operation erfolgreich war
- `message`: Benutzerfreundliche Nachricht über das Ergebnis
- `data`: Die eigentlichen Daten der Operation
- Bei Fehlern: detaillierte Fehlerinformationen

## Fehlerbehandlung

Häufige Fehler und Lösungen:

- **Cannot read properties of undefined (reading 'toISOString')**: Tritt auf, wenn Start- oder Endzeit eines Termins nicht korrekt formatiert sind. Stellen Sie sicher, dass gültige ISO-Datumsangaben verwendet werden.
- **Authentication failed**: Überprüfen Sie Ihre Anmeldedaten und stellen Sie sicher, dass das Passwort korrekt ist.
- **Couldn't find calendar**: Stellen Sie sicher, dass der angegebene Kalendername existiert.

## CalDAV-Kompatibilität

Diese Integration nutzt die CalDAV-Schnittstelle von Nextcloud und ist mit der RFC4918-Spezifikation kompatibel. Die Implementierung basiert auf der offiziellen Nextcloud-Dokumentation für CalDAV.

## Quellen und weiterführende Informationen

- [Nextcloud CalDAV-Dokumentation](https://docs.nextcloud.com/server/latest/admin_manual/groupware/calendar.html)
- [CalDAV-Spezifikation (RFC4918)](https://www.rfc-editor.org/rfc/rfc4918.html)
- [Nextcloud Calendar Integration Dokumentation](https://docs.nextcloud.com/server/latest/developer_manual/digging_deeper/groupware/calendar_provider.html)

## Lizenz

[MIT](LICENSE.md)

# Screenshot

![Screenshot](./img/screenshot.jpg)

# Changelog

## 0.2.2
2023-04-28

* Version bump to clean up dist folder before publishing on npm

## 0.2.1
2023-04-28

* Shut up linter

## 0.2.0
2023-04-28

* Added Events → Get Many

## 0.1.0
2023-04-28

* Added Calendar → Get Many 