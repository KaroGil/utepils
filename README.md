# 🍻 Utepils Meter

Måler stemningen for utepils basert på vært og tidspunkt på dagen 😎🍻

Bygget med **Next.js**, data fra **MET Norway weather data**, med et eget poengsystem.

Hvordan kjører man dette?

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## 🚀 Features

- 🌡️ Real-time utepils score
- 🌇 Sunset-aware scoring
- 📊 Daily peak estimation
- 📅 7-day forecast with best time per day

## API - endepunkter

### 🍺 Current Bergen Score

### Bergen

```http
GET /api/utepils/bergen
```

Response:

```{
  "city": "Bergen",
  "score": 73,
  "verdict": {
    "title": "Ganske bra",
    "subtitle": "Dette kan funke veldig fint",
    "emoji": "🍻"
  },
  "weather": {
    "temperature": 16,
    "wind": 3.4,
    "precipitation": 0,
    "condition": "partly-cloudy",
    "city": "Bergen"
  },
  "sun": {
    "sunset": "2026-03-19T18:42:00+01:00"
  },
  "peakToday": {
    "time": "17:00",
    "score": 81
  }
}
```

### Forecast

```http
GET /api/utepils/bergen/forecast
```

Response:

```
{
  "city": "Bergen",
  "predictions": [
    {
      "date": "2026-03-19",
      "label": "tor.",
      "score": 78,
      "bestHour": "16:00",
      "temperature": 15,
      "condition": "sunny"
    }
  ]
}
```

### Score by location

```http
GET /api/utepils?lat={lat}&lon={lon}
```

example:

```http
GET /api/utepils?lat=60.39299&lon=5.32415
```

Response:

```
{
  "score": 68,
  "verdict": {
    "title": "Helt greit",
    "subtitle": "Ikke topp, men absolutt mulig",
    "emoji": "🍺"
  },
  "weather": {
    "temperature": 14,
    "wind": 4.2,
    "precipitation": 0.3,
    "condition": "cloudy",
    "city": "Bergen"
  }
}
```
