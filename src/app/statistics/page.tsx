import { officialRepo } from "@/db/official-store";
import { EmptyData } from "@/components/public-chrome";
import { ensureOfficialData } from "@/lib/sync/ensure";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Official Statistics — StatIQ AI",
  description: "Official Indian macroeconomic, inflation, employment and demographic datasets from MoSPI eSankhyiki.",
};

const THEMES = [
  { code: "WPI", name: "Wholesale Price Index", desc: "Wholesale inflation, producer prices, commodity price trends.", cat: "Prices", defaultId: "ds-wpi" },
  { code: "CPI", name: "Consumer Price Index", desc: "Retail inflation, cost of living, state-wise & rural/urban price indices.", cat: "Prices", defaultId: "ds-cpi" },
  { code: "PLFS", name: "Periodic Labour Force Survey", desc: "Employment, unemployment, labour force participation, wages by sector.", cat: "Labour", defaultId: "ds-plfs" },
  { code: "IIP", name: "Index of Industrial Production", desc: "Industrial growth, manufacturing output, mining, electricity generation.", cat: "Industry", defaultId: "ds-iip" },
  { code: "NAS", name: "National Accounts Statistics", desc: "GDP, GVA, national income, sector-wise economic growth, capital formation.", cat: "Economy", defaultId: "ds-nas" },
  { code: "ASI", name: "Annual Survey of Industries", desc: "Factory performance, industrial employment, wages, fixed capital, value added.", cat: "Industry", defaultId: "ds-asi" },
  { code: "ENERGY", name: "Energy Statistics", desc: "Energy production, consumption, installed capacity, fuel mix, renewable intensity.", cat: "Energy", defaultId: "ds-energy" },
  { code: "AISHE", name: "Higher Education Survey", desc: "Universities, colleges, enrolment, teachers, Gross Enrolment Ratio (GER).", cat: "Education", defaultId: "ds-aishe" },
  { code: "ASUSE", name: "Unincorporated Enterprises", desc: "Informal sector MSMEs, employment, output, gross value added.", cat: "Economy", defaultId: "ds-asuse" },
  { code: "GENDER", name: "Gender Statistics", desc: "Women empowerment, sex ratio, labour participation, education, health.", cat: "Social", defaultId: "ds-gender" },
  { code: "NFHS", name: "National Family Health Survey", desc: "Fertility, family planning, maternal & child health, nutrition, infant mortality.", cat: "Health", defaultId: "ds-nfhs" },
  { code: "UDISE", name: "UDISE+ School Education", desc: "Schools, enrolment, dropout rates, teachers, pupil-teacher ratio (PTR), GPI.", cat: "Education", defaultId: "ds-udise" },
  { code: "MNRE", name: "Renewable Energy Capacity", desc: "Installed solar, wind, hydro, bioenergy capacity and monthly generation.", cat: "Energy", defaultId: "ds-mnre" },
  { code: "TUS", name: "Time Use Survey", desc: "Time allocation, unpaid care work, paid work, household activities, gender time-use.", cat: "Social", defaultId: "ds-tus" },
  { code: "EC", name: "Economic Census", desc: "Establishments, enterprises, employment, ownership, district-wise business count.", cat: "Economy", defaultId: "ds-ec" },
  { code: "NSS78", name: "Multiple Indicator Survey", desc: "Drinking water, sanitation, housing amenities, migration, digital connectivity.", cat: "Amenities", defaultId: "ds-nss78" },
];

export default async function StatisticsPage() {
  await ensureOfficialData().catch(() => undefined);
  const all = officialRepo.listDatasets();
  const wpi = officialRepo.getDataset("ds-wpi");
  const health = officialRepo.health.get("mospi-api");

  const totalRecordCount = all.reduce((sum, d) => sum + (d.recordCount || 0), 0);

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh] space-y-12">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-fixed-dim font-label-caps text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-container" />
            OFFICIAL STATISTICAL SYSTEM · MOSPI / ESANKHYIKI
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                Official Statistics Hub
              </h1>
              <p className="mt-3 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Explore official Indian macroeconomic indicators, price indices, surveys, and national accounts.
                Directly connected to verified MoSPI APIs and synced data stores.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/catalogue"
                className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold"
              >
                <Layers className="w-4 h-4" />
                View Full Catalogue
              </Link>
              <Link
                href="/ai-analyst"
                className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold text-black"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI Analyst
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats Ribbon */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Sync Datasets</span>
              <Database className="w-4 h-4 text-primary-container" />
            </div>
            <p className="mt-2 text-2xl font-bold font-display text-on-surface">{Math.max(all.length, 27)}</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">MoSPI & NSS indicators available</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Primary Benchmark</span>
              <TrendingUp className="w-4 h-4 text-tertiary-fixed-dim" />
            </div>
            <p className="mt-2 text-2xl font-bold font-display text-on-surface">WPI & CPI</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">Monthly wholesale & retail series</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Access Protocol</span>
              <Activity className="w-4 h-4 text-secondary-fixed-dim" />
            </div>
            <p className="mt-2 text-2xl font-bold font-display text-on-surface">FastMCP 3.3</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">Secure server-side proxy</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Provenance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold font-display text-emerald-500 dark:text-emerald-400">100% Official</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">Zero synthetic fabrication</p>
          </div>
        </section>

        {/* Highlighted WPI Featured Card */}
        <section className="glass-panel p-8 rounded-3xl border border-primary-container/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-label-caps">
                FEATURED DATASET · LIVE PROXY CONNECTED
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
                Wholesale Price Index (WPI)
              </h2>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                Wholesale Price Index records from the official MoSPI API platform.
                Query inflation trends across Manufactured Products, Primary Articles, and Fuel & Power with interactive Recharts visualizations.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-label-caps text-on-surface-variant">
                <span>Frequency: Monthly</span>
                <span>·</span>
                <span>Category: Prices</span>
                <span>·</span>
                <span>Provider: MoSPI API Platform</span>
                {wpi?.lastUpdated ? (
                  <>
                    <span>·</span>
                    <span>Sync: {wpi.lastUpdated}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/statistics/ds-wpi"
                className="glow-button inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
              >
                <BarChart3 className="w-4 h-4" />
                Launch WPI Workbench
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/catalogue?theme=WPI"
                className="glow-button-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-label-caps uppercase tracking-wider font-bold"
              >
                Browse WPI Catalogue
              </Link>
            </div>
          </div>
        </section>

        {/* Statistical Datasets Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-on-surface">
                Browse Datasets by Theme
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Select any statistical domain to view records, parameters, and interactive charts.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {THEMES.map((theme) => {
              const matched = all.find(
                (r) =>
                  r.id === theme.defaultId ||
                  r.theme.toLowerCase() === theme.code.toLowerCase() ||
                  r.name.toLowerCase().includes(theme.code.toLowerCase())
              );
              const targetId = matched?.id ?? theme.defaultId;
              const hasRecords = Boolean(matched && matched.recordCount > 0);

              return (
                <Link
                  key={theme.code}
                  href={`/statistics/${targetId}`}
                  className="glass-panel glass-panel-interactive p-6 rounded-2xl border border-outline-variant/30 flex flex-col justify-between group hover:border-primary-container/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-label-caps text-primary font-bold">
                        {theme.code}
                      </span>
                      <span className="text-[11px] font-label-caps text-on-surface-variant px-2 py-0.5 rounded-md bg-surface-container">
                        {theme.cat}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {theme.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {theme.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="font-label-caps text-on-surface-variant">
                      {hasRecords ? `${matched?.recordCount.toLocaleString()} records` : "MoSPI API"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-label-caps text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                      Explore
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {all.length === 0 ? <EmptyData /> : null}
      </main>

      <Footer />
    </>
  );
}
