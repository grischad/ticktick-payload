# TickTick Payload Integration

Diese Anwendung ist eine Integration zwischen TickTick und Payload CMS, die eine erweiterte Aufgabenverwaltung mit ICE-Scoring (Impact, Confidence, Ease) ermöglicht.

## Funktionen

### Bidirektionale Synchronisation

- Automatische Synchronisation zwischen TickTick und Payload alle 5 Minuten
- Manuelle Synchronisation per Knopfdruck in der Benutzeroberfläche
- Sofortige Synchronisation bei Änderungen in der UI

### Aufgabenverwaltung

- Anzeige aller TickTick-Aufgaben in einer übersichtlichen Liste
- Erweitertes ICE-Scoring System für jede Aufgabe:
  - Impact (Auswirkung): Bewertung von 1-10
  - Confidence (Zuversicht): Bewertung von 1-10
  - Ease (Einfachheit): Bewertung von 1-10
- Automatische Prioritätsberechnung basierend auf ICE-Scores:
  - Hohe Priorität (5): ICE-Score ≥ 8
  - Mittlere Priorität (3): ICE-Score ≥ 5
  - Niedrige Priorität (1): ICE-Score ≥ 3
  - Keine Priorität (0): ICE-Score < 3

### Technische Features

- Sichere API-Integration mit TickTick
- Automatische Hintergrund-Synchronisation via Payload Jobs
- Fehlerbehandlung und Logging
- Zugriffskontrolle für die Job-Ausführung

## Umgebungsvariablen

```env
TICKTICK_ACCESS_TOKEN=dein-ticktick-token
PAYLOAD_SECRET=dein-payload-secret
DATABASE_URI=deine-mongodb-uri
```

## Entwicklung

### Installation

```bash
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist dann unter `http://localhost:3000` verfügbar.
