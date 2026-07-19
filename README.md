# Sentinel Bot

Sentinel ist ein Discord-Bot, den ich mit Node.js und Discord.js entwickle.

## Funktionen

- `/ping` prüft, ob der Bot erreichbar ist
- `/serverinfo` zeigt Informationen über den Server
- `/userinfo` zeigt Informationen über einen Nutzer
- Automatische Begrüßung neuer Mitglieder
- `/willkommen-test` zeigt eine Vorschau der Begrüßung
- `/clear` löscht Nachrichten für Moderatoren

## Technologien

- JavaScript
- Node.js
- Discord.js
- dotenv

## Installation

Repository herunterladen:

```bash
git clone https://github.com/XrayShuvit/sentinel-bot.git
```

Abhängigkeiten installieren:

```bash
npm install
```

Eine `.env`-Datei erstellen:

```env
DISCORD_TOKEN=DEIN_BOT_TOKEN
```

Bot starten:

```bash
node index.js
```

## Sicherheit

Der Bot-Token wird über eine `.env`-Datei geladen und nicht auf GitHub veröffentlicht.

## Geplante Funktionen

- Begrüßung neuer Mitglieder
- Moderationsbefehle
- Warnsystem
- Konfigurierbarer Begrüßungskanal
- Datenbank

## Entwickler

Entwickelt von [Tim](https://github.com/XrayShuvit).