<p align="center">
  <img src="public/logo-light-mode-with-texts.png" alt="SIGAPP Logo" width="300" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind--CSS-3.4-38bdf8?logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ecf8e?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Leaflet-GIS-199900?logo=leaflet" alt="Leaflet" />
</p>

---

## Overview

**SIGAPP** (Sistem Informasi Prioritas Intervensi Sekolah) is an advanced WebGIS decision-support system designed to identify and prioritize schools requiring immediate intervention within Jakarta. By aggregating multi-dimensional data into a single, actionable index, SIGAPP empowers government stakeholders, educators, and community partners to allocate resources effectively where they are most needed.

The platform utilizes a data-driven approach to rank schools based on structural, academic, and social vulnerabilities, providing automated analysis and communication tools through specialized AI Agents.

---

## The SIGAPP Index

The core of the platform is the **SIGAPP Index**, a composite metric calculated through four critical pillars of school performance and environment:

| Pillar | Focus Area | Weight | Description |
| :--- | :--- | :--- | :--- |
| **P1** | Quality Gap | 35% | Academic disparities, literacy, and numeracy performance. |
| **P2** | Spatial Inequity | 25% | Accessibility, travel time, and geographical isolation. |
| **P3** | Structural Risk | 25% | Physical building condition and infrastructure safety. |
| **P4** | Public Signal | 15% | Frequency of community complaints and public feedback. |

---

## Core Features

### 1. Interactive WebGIS Dashboard
A high-performance map interface powered by Leaflet.js that visualizes school locations with dynamic color-coding based on their priority tier (Critical, High, Medium, Low). Users can filter by city, education level, and priority status in real-time.

### 2. Deep Linking & State Persistence
The dashboard state is synchronized with URL query parameters. This allows users to share specific filtered views, selected schools, or active tabs via simple URLs, ensuring consistent state across sessions and browser refreshes.

### 3. Intelligent AI Agents
*   **Report Agent**: Automatically generates comprehensive intervention reports in PDF format, analyzing dominant vulnerability pillars and providing tailored recommendations.
*   **Email Agent**: Streamlines stakeholder coordination by automating outreach to schools, local authorities, and provincial departments, including response monitoring and automated escalation.

### 4. Advanced Analytics & Insights
Visual breakdown of school metrics using Radar charts, Sankey diagrams, and trend analysis. The system provides automated narrative summaries of school conditions based on the underlying multi-pillar data.

---

## Technology Stack

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Database & Auth**: Supabase (PostgreSQL)
*   **Mapping**: Leaflet.js & OpenStreetMap
*   **Charts**: Recharts
*   **PDF Generation**: jsPDF
*   **Icons**: Lucide React

---

## Getting Started

### Prerequisites

*   Node.js 18.x or later
*   npm or yarn
*   A Supabase project (for database access)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zakiulfahmijailani/SIGAPP.git
   cd SIGAPP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

---

## Database Schema

The application relies on a structured PostgreSQL schema optimized for GIS and analytical queries:

*   `schools`: Primary school data (NPSN, coordinates, level, address).
*   `school_index`: Real-time calculation of SIGAPP pillars and the final composite index.
*   `pillar_variables`: Raw data metrics used for pillar calculations (e.g., test scores, building damage weights).

---

## License

This project is developed for Jakarta's educational infrastructure improvement. All rights reserved.
