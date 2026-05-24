# MOCK_DATA_SPEC.md — AGATA MVP Mock Data Specification

Project: AGATA — Agentic GeoAI for Ambulance and Triage Assistance
Purpose: Define all mock data required for the MVP showcase. No real API calls needed.

---

## 1. Mock Hospital Dataset

File location: `src/lib/mock/mockHospitals.ts`

All coordinates are real Jakarta hospital locations sourced from public data.
Distance and bed availability are simulated for demonstration purposes.

### TypeScript Type Definition

```ts
export type AvailabilityStatus = 'available' | 'limited' | 'full';

export interface MockHospital {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  distanceKm: number;
  bedsAvailable: number;
  totalBeds: number;
  availabilityStatus: AvailabilityStatus;
  specialization: string;
  estimatedTravelMinutes: number;
  address: string;
}
```

### Hospital Entries (15 hospitals)

| id | name | lat | lng | distanceKm | bedsAvailable | totalBeds | status | specialization |
|----|------|-----|-----|------------|---------------|-----------|--------|----------------|
| RS001 | RSUPN Dr. Cipto Mangunkusumo | -6.1955 | 106.8451 | 1.2 | 12 | 80 | available | General / Trauma |
| RS002 | RS Persahabatan | -6.1899 | 106.8917 | 3.8 | 5 | 60 | limited | Pulmonology / General |
| RS003 | RS Islam Jakarta Pusat | -6.1750 | 106.8337 | 2.1 | 18 | 50 | available | General |
| RS004 | RS Tarakan | -6.1624 | 106.8245 | 2.9 | 0 | 40 | full | General |
| RS005 | RSUD Koja | -6.1111 | 106.9001 | 6.4 | 22 | 70 | available | General / Emergency |
| RS006 | RS Fatmawati | -6.2942 | 106.7986 | 9.1 | 8 | 55 | limited | General / Orthopedics |
| RS007 | RS Pasar Rebo | -6.3196 | 106.8672 | 11.3 | 14 | 45 | available | General |
| RS008 | RS Carolus | -6.1869 | 106.8394 | 1.8 | 3 | 35 | limited | General / Maternity |
| RS009 | RS Pluit | -6.1145 | 106.7940 | 7.2 | 20 | 65 | available | General / Cardiac |
| RS010 | RS Mitra Keluarga Kelapa Gading | -6.1566 | 106.9071 | 5.5 | 11 | 50 | available | General |
| RS011 | RS Hermina Daan Mogot | -6.1791 | 106.7339 | 6.8 | 7 | 40 | limited | General / Maternity |
| RS012 | RS Tebet | -6.2396 | 106.8504 | 5.3 | 16 | 45 | available | General |
| RS013 | RS Omni Pulomas | -6.1879 | 106.9023 | 4.6 | 9 | 30 | limited | General |
| RS014 | RS Siloam Semanggi | -6.2239 | 106.8195 | 4.0 | 0 | 60 | full | General / Cardiac |
| RS015 | RSUD Matraman | -6.2104 | 106.8613 | 2.6 | 19 | 35 | available | General / Emergency |

### estimatedTravelMinutes Lookup

- 0–3 km → 8–15 minutes
- 3–6 km → 15–25 minutes
- 6–10 km → 25–40 minutes
- 10+ km → 40–60 minutes

---

## 2. Demo Patient Scenarios

File location: `src/lib/mock/mockScenarios.ts`

Three deterministic scenarios. Each maps a user chat input to a patient location, map zoom target, ranked hospital list, and scripted chatbot response.

### Scenario A — Central Jakarta (Cempaka Putih)

**Trigger keywords**: `cempaka putih`, `jakarta pusat`, `central`

**Patient location**: lat -6.1726, lng 106.8650

**Map target**: zoom to lat -6.1726, lng 106.8650, zoom level 13

**Recommended hospitals** (ranked):
1. RSUPN Dr. Cipto Mangunkusumo (RS001) — 1.2 km — 12 beds — closest
2. RS Islam Jakarta Pusat (RS003) — 2.1 km — 18 beds — best capacity
3. RSUD Matraman (RS015) — 2.6 km — 19 beds — balanced

**Scripted chatbot response**:
```
AGATA telah menganalisis lokasi pasien di Cempaka Putih, Jakarta Pusat.

Berdasarkan jarak dan kapasitas tempat tidur saat ini, berikut adalah 3 rekomendasi teratas:

🏥 1. RSUPN Dr. Cipto Mangunkusumo
   Jarak: 1.2 km | Est. waktu: ~8 menit | Tempat tidur tersedia: 12
   Alasan: Rumah sakit terdekat dari lokasi pasien.

🏥 2. RS Islam Jakarta Pusat
   Jarak: 2.1 km | Est. waktu: ~12 menit | Tempat tidur tersedia: 18
   Alasan: Kapasitas tertinggi di area terdekat.

🏥 3. RSUD Matraman
   Jarak: 2.6 km | Est. waktu: ~14 menit | Tempat tidur tersedia: 19
   Alasan: Pilihan seimbang antara jarak dan kapasitas.

Rekomendasi utama: RSUPN Dr. Cipto Mangunkusumo
```

---

### Scenario B — South Jakarta (Tebet)

**Trigger keywords**: `tebet`, `jakarta selatan`, `south`

**Patient location**: lat -6.2396, lng 106.8504

**Map target**: zoom to lat -6.2396, lng 106.8504, zoom level 13

**Recommended hospitals** (ranked):
1. RS Tebet (RS012) — 0.3 km — 16 beds — closest
2. RS Siloam Semanggi (RS014) — 2.1 km — 0 beds — PENUH, tidak direkomendasikan
3. RS Fatmawati (RS006) — 5.2 km — 8 beds — alternatif

**Scripted chatbot response**:
```
AGATA telah menganalisis lokasi pasien di Tebet, Jakarta Selatan.

Berdasarkan jarak dan kapasitas tempat tidur saat ini, berikut adalah rekomendasi:

🏥 1. RS Tebet
   Jarak: 0.3 km | Est. waktu: ~3 menit | Tempat tidur tersedia: 16
   Alasan: Rumah sakit terdekat dengan kapasitas memadai.

⚠️ RS Siloam Semanggi (2.1 km) saat ini dalam kondisi PENUH. Tidak direkomendasikan.

🏥 2. RS Fatmawati
   Jarak: 5.2 km | Est. waktu: ~22 menit | Tempat tidur tersedia: 8
   Alasan: Alternatif jika RS Tebet penuh, memiliki unit ortopedi.

Rekomendasi utama: RS Tebet
```

---

### Scenario C — East Jakarta (Matraman)

**Trigger keywords**: `matraman`, `jakarta timur`, `east`

**Patient location**: lat -6.2104, lng 106.8613

**Map target**: zoom to lat -6.2104, lng 106.8613, zoom level 13

**Recommended hospitals** (ranked):
1. RSUD Matraman (RS015) — 0.5 km — 19 beds — closest
2. RS Persahabatan (RS002) — 4.1 km — 5 beds — limited
3. RS Pasar Rebo (RS007) — 7.2 km — 14 beds — available

**Scripted chatbot response**:
```
AGATA telah menganalisis lokasi pasien di Matraman, Jakarta Timur.

Berdasarkan jarak dan kapasitas tempat tidur saat ini, berikut adalah rekomendasi:

🏥 1. RSUD Matraman
   Jarak: 0.5 km | Est. waktu: ~4 menit | Tempat tidur tersedia: 19
   Alasan: Rumah sakit terdekat dengan kapasitas baik dan unit darurat.

🏥 2. RS Persahabatan
   Jarak: 4.1 km | Est. waktu: ~18 menit | Tempat tidur tersedia: 5
   Alasan: Alternatif dengan spesialisasi paru-paru jika diperlukan.

🏥 3. RS Pasar Rebo
   Jarak: 7.2 km | Est. waktu: ~30 menit | Tempat tidur tersedia: 14
   Alasan: Pilihan dengan kapasitas lebih baik jika dua RS terdekat penuh.

Rekomendasi utama: RSUD Matraman
```

---

## 3. Mock Agent Workflow Steps

File location: `src/lib/mock/mockAgentSteps.ts`

These steps drive the Agent Pipeline Visualization animation.

```ts
export interface AgentStep {
  id: string;
  label: string;
  description: string;
  delayMs: number;
  icon: string;
}

export const mockAgentSteps: AgentStep[] = [
  {
    id: 'query-parser',
    label: 'Query Parser',
    description: 'Mengidentifikasi lokasi pasien dari input teks...',
    delayMs: 800,
    icon: '🔍',
  },
  {
    id: 'data-retrieval',
    label: 'Data Retrieval',
    description: 'Mengambil data rumah sakit dan kapasitas real-time...',
    delayMs: 1200,
    icon: '📡',
  },
  {
    id: 'spatial-analysis',
    label: 'Spatial Analysis',
    description: 'Menghitung jarak dan aksesibilitas rute ambulans...',
    delayMs: 1000,
    icon: '🗺️',
  },
  {
    id: 'report-generator',
    label: 'Recommendation Generator',
    description: 'Menyusun rekomendasi berdasarkan jarak dan kapasitas...',
    delayMs: 700,
    icon: '✅',
  },
];
```

---

## 4. Mock KPI Summary Values

File location: `src/lib/mock/mockKpis.ts`

```ts
export const mockKpis = {
  totalHospitals: 15,
  availableHospitals: 8,
  limitedHospitals: 5,
  fullHospitals: 2,
  totalBedsAvailable: 164,
  averageTravelMinutes: 18,
  coverageAreaKm2: 662,
};
```

---

## 5. System Greeting Message

Display as the initial chatbot message on dashboard load.

```
Halo, saya AGATA — Agentic GeoAI for Ambulance and Triage Assistance.

Saya dapat membantu merekomendasikan rumah sakit tujuan ambulans berdasarkan
lokasi pasien dan ketersediaan kapasitas rumah sakit.

Silakan ketik lokasi pasien untuk memulai.

Contoh:
• "Pasien di Cempaka Putih"
• "Pasien di Tebet"
• "Pasien di Matraman"
```

---

## 6. Fallback Response

When user input does not match any known scenario:

```
Maaf, lokasi tersebut belum tersedia dalam demo ini.

Untuk showcase ini, silakan coba salah satu lokasi berikut:
• Cempaka Putih (Jakarta Pusat)
• Tebet (Jakarta Selatan)
• Matraman (Jakarta Timur)
```

---

## Notes for Agent

- All data is mock / simulated. Do NOT connect to any external API.
- Coordinates are real Jakarta hospital locations but distances and bed counts are fabricated for demo.
- Matching user input to a scenario must be case-insensitive and partial-match based.
- The scripted responses are final — do not modify them during implementation.
- Travel time estimates are intentionally rough (for showcase only).
