# n8n-nodes-nextcloud-calendar

Ein [n8n](https://n8n.io) Node für die Integration mit Nextcloud Calendar.

## Features

- Kalender verwalten (erstellen, löschen, auflisten)
- Termine verwalten (erstellen, aktualisieren, löschen, suchen)
- Volle Unterstützung für Nextcloud-spezifische Funktionen:
  - Benachrichtigungen
  - Push-Benachrichtigungen
  - Einladungen
  - Export-Kontrolle

## Installation

### In n8n:
1. Gehen Sie zu "Einstellungen" > "Community Nodes"
2. Wählen Sie "Installieren"
3. Geben Sie `n8n-nodes-nextcloud-calendar` ein
4. Klicken Sie auf "Installieren"

### Manuell:
```bash
npm install n8n-nodes-nextcloud-calendar
```

## Konfiguration

1. Erstellen Sie ein App-Passwort in Ihrer Nextcloud-Instanz:
   - Einstellungen > Sicherheit > App-Passwörter
   - Geben Sie einen Namen ein (z.B. "n8n")
   - Kopieren Sie das generierte Passwort

2. Fügen Sie die Zugangsdaten in n8n hinzu:
   - Nextcloud URL: Ihre Nextcloud-Instanz URL
   - Benutzername: Ihr Nextcloud Benutzername
   - Passwort: Das generierte App-Passwort

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