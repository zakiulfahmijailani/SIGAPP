export default function AboutPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── 1. What is SIGAPP ─────────────────────────────────── */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">About SIGAPP</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
          <p>
            The School Intervention Gap Prioritization Platform (SIGAPP) is a 
            data-driven tool designed to assist education policymakers and 
            administrators in identifying schools that urgently require structural 
            or academic interventions. By synthesizing multiple data streams into 
            a composite index, SIGAPP provides an objective, spatial, and 
            need-based framework for resource allocation.
          </p>
          <p>
            Rather than relying solely on raw academic scores, the SIGAPP composite 
            index evaluates four distinct pillars: Quality Gap, Spatial Inequity, 
            Structural Risk, and Public Signal. This multi-dimensional approach 
            ensures that hidden vulnerabilities—such as long travel times, 
            dilapidated infrastructure, or high public complaint frequencies—are 
            weighted appropriately alongside academic and poverty metrics.
          </p>
        </div>
      </section>

      {/* ── 2. Four Pillars ───────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
          The Four Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* P1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-slate-800">P1 Quality Gap</h3>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600">
                35%
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4 h-10">
              Measures academic deficiency and socio-economic vulnerability.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">Rapor Pendidikan</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">BPS Data</span>
            </div>
          </div>

          {/* P2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-slate-800">P2 Spatial Inequity</h3>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-600">
                25%
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4 h-10">
              Assesses geographic isolation and average student travel burdens.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">Google Earth Engine</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">OSM</span>
            </div>
          </div>

          {/* P3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-slate-800">P3 Structural Risk</h3>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-yellow-50 text-yellow-600">
                25%
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4 h-10">
              Quantifies physical infrastructure damage and historic enrollment drops.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">Dapodik</span>
            </div>
          </div>

          {/* P4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-slate-800">P4 Public Signal</h3>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-teal-50 text-teal-600">
                15%
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4 h-10">
              Incorporates community complaints and sentiment regarding the facility.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">Social Media Aggregation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Data Sources Table ─────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
          Data Sources
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-5 py-3 w-[220px]">Source</th>
                  <th className="px-5 py-3">Key Variables</th>
                  <th className="px-5 py-3">Role in Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">Rapor Pendidikan</td>
                  <td className="px-5 py-4">Literacy, Numeracy, Teacher Quality</td>
                  <td className="px-5 py-4 text-slate-500">Core inputs for P1 (Quality Gap) representing foundational academic health.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">Dapodik</td>
                  <td className="px-5 py-4">Building Damage Weight, 3-yr Enrollment Trends</td>
                  <td className="px-5 py-4 text-slate-500">Drives P3 (Structural Risk) by identifying physical decay and student flight.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">BPS</td>
                  <td className="px-5 py-4">Poverty Rate per Kelurahan</td>
                  <td className="px-5 py-4 text-slate-500">Used as an equity multiplier within P1 to prioritize socio-economic need.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">Google Earth Engine</td>
                  <td className="px-5 py-4">Spatial Settlement Density</td>
                  <td className="px-5 py-4 text-slate-500">Contextualizes school catchment areas for P2 (Spatial Inequity).</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">OpenStreetMap</td>
                  <td className="px-5 py-4">Travel Time (Isochrones)</td>
                  <td className="px-5 py-4 text-slate-500">Core metric for P2 mapping isolation and commute difficulties.</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">Social Media</td>
                  <td className="px-5 py-4">Complaint Frequency</td>
                  <td className="px-5 py-4 text-slate-500">Provides community-driven urgency signals for P4 (Public Signal).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. Disclaimer ─────────────────────────────────────── */}
      <section className="mb-16">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">Data Privacy Disclaimer</p>
          <p>
            All data displayed within SIGAPP is strictly aggregated or institutional-level 
            information. No Personally Identifiable Information (PII) regarding individual 
            students, parents, or teachers is processed, stored, or displayed, in strict 
            compliance with UU PDP No. 27 Tahun 2022 (Personal Data Protection Law). 
            Variables such as <i>Poverty Rate</i> are measured strictly at the macro (Kelurahan) level.
          </p>
        </div>
      </section>

      {/* ── 5. Footer Note ────────────────────────────────────── */}
      <footer className="border-t border-slate-200 pt-6 text-center">
        <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
          SIGAPP MVP v0.1 · Jakarta · 2025
        </p>
      </footer>
    </div>
  );
}
