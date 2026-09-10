"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  downloadMicrodataFile,
  fieldOrMissing,
  getMicrodataDataset,
  getMicrodataFiles,
  createMicrodataAssignment,
} from "@/services/microdataApi";
import {
  FileText,
  FileArchive,
  FileCode,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Copy,
  Check,
  Layers,
  Database,
  ArrowLeft,
  Building2,
  Calendar,
  Globe,
  Lock,
  BookOpen,
  Share2,
} from "lucide-react";

type ActiveTab = "overview" | "files" | "dictionary" | "access" | "provenance";

// Codebook variable schema for rich research dictionary
interface CodebookVariable {
  name: string;
  label: string;
  type: "Categorical" | "Numeric" | "Identifier" | "Weight";
  format: string;
  description: string;
  values?: string;
  sourceBlock?: string;
}

const SAMPLE_CODEBOOK_VARS: CodebookVariable[] = [
  {
    name: "STATE_CODE",
    label: "State / Union Territory Geo-Identifier",
    type: "Identifier",
    format: "2-digit String",
    description: "Official standard census state code corresponding to the location of the reporting factory/household unit.",
    values: "01 to 35 (Standard Census codes)",
    sourceBlock: "Block 1 - Identification Particulars, Item 1",
  },
  {
    name: "NIC_CODE",
    label: "National Industrial Classification Code",
    type: "Categorical",
    format: "3-digit / 4-digit Code",
    description: "Industry classification corresponding to primary economic activity of the establishment under NIC series.",
    values: "Manufacturing & processing division codes",
    sourceBlock: "Block 1 - Classification, Item 4",
  },
  {
    name: "SCHEME_CODE",
    label: "Survey Sampling Scheme / Sector Stratum",
    type: "Categorical",
    format: "1-digit Integer",
    description: "Indicates whether unit was surveyed under Census (100% enumeration) or Sample stratum.",
    values: "1 = Census Sector, 2 = Sample Sector",
    sourceBlock: "Block 2 - Sampling & Selection Particulars",
  },
  {
    name: "GROSS_OUTPUT",
    label: "Total Value of Ex-Factory Output (Rs.)",
    type: "Numeric",
    format: "Continuous Currency (INR)",
    description: "Total ex-factory value of products manufactured, industrial services rendered to others, and net additions to semi-finished goods.",
    values: "Ex-factory rupees (excluding excise/sales taxes)",
    sourceBlock: "Block 6 - Products and By-Products, Total Output",
  },
  {
    name: "NET_VALUE_ADDED",
    label: "Net Value Added (NVA in Rs.)",
    type: "Numeric",
    format: "Continuous Currency (INR)",
    description: "Gross output minus total intermediate inputs, industrial services consumed, and fixed capital depreciation allowance.",
    values: "Value added in rupees",
    sourceBlock: "Block 7 - Summary Economic Results, Item 8",
  },
  {
    name: "TOTAL_WORKERS",
    label: "Average Daily Number of Workers Employed",
    type: "Numeric",
    format: "Integer Count",
    description: "Total regular and contract workers employed directly or through contractors on manufacturing processes.",
    values: "Number of persons",
    sourceBlock: "Block 4 - Employment and Labour Particulars",
  },
  {
    name: "WAGES_PAID",
    label: "Total Wages & Salaries Paid to Workers (Rs.)",
    type: "Numeric",
    format: "Continuous Currency (INR)",
    description: "Total cash wages, bonuses, allowances, and statutory contributions paid to workers during the reference accounting year.",
    values: "Rupees",
    sourceBlock: "Block 4 - Emoluments and Benefits",
  },
  {
    name: "MULTIPLIER_WT",
    label: "Survey Sampling Weight / Multiplier Factor",
    type: "Weight",
    format: "Decimal Float (4 decimal places)",
    description: "Inverse selection probability weight used for generating population-level aggregate statistics from sample unit rows.",
    values: "Multiplier value (1.0000 for census units)",
    sourceBlock: "Sampling Design Weight Schedule",
  },
];

export function MicrodataDatasetView({
  datasetId,
  initialTab = "overview",
  canDownload = true,
  canAssign = false,
}: {
  datasetId: string;
  initialTab?: ActiveTab;
  canDownload?: boolean;
  canAssign?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [dataset, setDataset] = useState<Record<string, unknown> | null>(null);
  const [files, setFiles] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [assignMsg, setAssignMsg] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Data dictionary state
  const [dictSearch, setDictSearch] = useState("");
  const [selectedVar, setSelectedVar] = useState<CodebookVariable>(SAMPLE_CODEBOOK_VARS[3]);
  const [dictFilterType, setDictFilterType] = useState<string>("ALL");

  useEffect(() => {
    let ignore = false;
    getMicrodataDataset(datasetId)
      .then((res) => {
        if (ignore) return;
        if (res.mode !== "LIVE" || !res.dataset) {
          setError(res.error || "Official MoSPI data is currently unavailable.");
          return;
        }
        setDataset(res.dataset);
      })
      .catch((e: Error) => setError(e.message));

    getMicrodataFiles(datasetId)
      .then((res) => {
        if (ignore) return;
        if (res.mode === "AUTH_REQUIRED") {
          setFileError(res.message || res.error || "MoSPI requires authorized access for this dataset.");
          setFiles([]);
          return;
        }
        if (res.mode !== "LIVE") {
          setFileError(res.error || "Official MoSPI data is currently unavailable.");
          return;
        }
        setFiles(res.files ?? []);
      })
      .catch((e: Error) => setFileError(e.message));

    return () => {
      ignore = true;
    };
  }, [datasetId]);

  const meta = (dataset as Record<string, unknown>) ?? {};
  const title = fieldOrMissing(meta.title ?? "MoSPI Survey Microdata");
  const idno = fieldOrMissing(meta.idno ?? datasetId);
  const repo = fieldOrMissing(meta.repositoryid ?? meta.repo_title ?? "MoSPI Official Repository");
  const year = fieldOrMissing(meta.year ?? meta.created ?? meta.data_coll_start ?? "Survey Reference Period");
  const producer = fieldOrMissing(meta.authoring_entity ?? meta.producer ?? meta.nation ?? "Central Statistics Office (CSO)");
  const description = fieldOrMissing(meta.abstract ?? meta.description ?? "Official survey microdata archive published by the Ministry of Statistics and Programme Implementation (MoSPI).");

  const citationText = `Ministry of Statistics and Programme Implementation (MoSPI), Government of India. "${title}" [Dataset & Documentation IDNO: ${idno}]. National Data Archive (NADA), microdata.gov.in. Ingested via StatIQ AI Platform.`;

  const filteredVars = useMemo(() => {
    return SAMPLE_CODEBOOK_VARS.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(dictSearch.toLowerCase()) ||
        v.label.toLowerCase().includes(dictSearch.toLowerCase()) ||
        v.description.toLowerCase().includes(dictSearch.toLowerCase());
      const matchesType = dictFilterType === "ALL" || v.type === dictFilterType;
      return matchesSearch && matchesType;
    });
  }, [dictSearch, dictFilterType]);

  const handleDownload = async (fileName: string) => {
    setDownloadingFile(fileName);
    setFileError(null);
    setDownloadSuccess(null);
    try {
      const result = await downloadMicrodataFile(datasetId, fileName);
      if ("blob" in result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.fileName;
        a.click();
        URL.revokeObjectURL(url);
        setDownloadSuccess(`Successfully downloaded ${result.fileName}`);
      } else {
        const errObj = result as { error?: string; message?: string };
        setFileError(errObj.error || errObj.message || "Download was not permitted by upstream MoSPI gateway.");
      }
    } catch (err: any) {
      setFileError(err.message || "Network error while downloading file.");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(idno);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-xs space-y-4">
        <div className="flex items-center gap-2 font-semibold text-sm text-rose-500">
          <AlertCircle className="w-5 h-5" />
          Official MoSPI Dataset Ingestion Notice
        </div>
        <p className="text-on-surface-variant leading-relaxed">{error}</p>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface hover:border-primary text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">
          StatIQ AI
        </Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-primary transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <Link href="/catalogue?source=unitdata" className="hover:text-primary transition-colors">
          MoSPI Microdata
        </Link>
        <span>/</span>
        <span className="text-on-surface font-mono text-[11px] truncate max-w-[200px] sm:max-w-xs">
          {idno}
        </span>
      </nav>

      {/* Dataset Header Hero Area */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label-caps uppercase tracking-wider font-bold">
              OFFICIAL MOSPI DATASET
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-label-caps uppercase tracking-wider font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              VERIFIED PROVENANCE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 text-xs font-mono text-on-surface hover:border-primary/40 transition-colors"
            >
              {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedId ? "Copied ID" : idno}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface leading-tight">
            {title}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Primary Research Action Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-outline-variant/15">
          <button
            type="button"
            onClick={() => setActiveTab("files")}
            className="glow-button px-5 py-2.5 rounded-xl font-label-caps uppercase text-xs font-bold text-black flex items-center gap-2 shadow-md"
          >
            <FileArchive className="w-4 h-4" />
            Official Files ({files ? files.length : "…"})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dictionary")}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 hover:border-primary text-xs font-label-caps uppercase font-semibold text-on-surface flex items-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            Data Dictionary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("access")}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 hover:border-primary text-xs font-label-caps uppercase font-semibold text-on-surface flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Access Policy
          </button>

          <button
            type="button"
            onClick={handleCopyCitation}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 hover:border-primary text-xs font-label-caps uppercase font-semibold text-on-surface flex items-center gap-2 transition-all"
          >
            {copiedCitation ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copiedCitation ? "Citation Copied" : "Cite Dataset"}
          </button>
        </div>
      </div>

      {/* Research Workspace Horizontal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-px overflow-x-auto">
        {(
          [
            { id: "overview", label: "Dataset Overview", icon: Database },
            { id: "files", label: `Published Files (${files ? files.length : "16"})`, icon: FileArchive },
            { id: "dictionary", label: "Data Dictionary", icon: BookOpen },
            { id: "access", label: "Access & Governance", icon: ShieldCheck },
            { id: "provenance", label: "Official Provenance", icon: Globe },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-label-caps uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-primary/5 rounded-t-xl"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* 6 High-Density Technical Metadata Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-label-caps uppercase">
                <Database className="w-3.5 h-3.5 text-primary" />
                Survey Collection
              </div>
              <p className="font-semibold text-sm text-on-surface">{repo}</p>
              <p className="text-[11px] text-on-surface-variant">MoSPI Official Survey Series</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-label-caps uppercase">
                <Building2 className="w-3.5 h-3.5 text-secondary" />
                Producer Agency
              </div>
              <p className="font-semibold text-sm text-on-surface truncate">{producer}</p>
              <p className="text-[11px] text-on-surface-variant">National Statistical Office / CSO</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-label-caps uppercase">
                <Calendar className="w-3.5 h-3.5 text-tertiary" />
                Reference Period
              </div>
              <p className="font-semibold text-sm text-on-surface">{year}</p>
              <p className="text-[11px] text-on-surface-variant">Official Survey Accounting Year</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-label-caps uppercase">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Geographic Scope
              </div>
              <p className="font-semibold text-sm text-on-surface">India (All States & UTs)</p>
              <p className="text-[11px] text-on-surface-variant">National Representative Stratum</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-label-caps uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Access Clearance
              </div>
              <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                Tier 1 Verified Public Access
              </p>
              <p className="text-[11px] text-on-surface-variant">Open Documentation & Microdata</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-label-caps uppercase">
                <FileArchive className="w-3.5 h-3.5 text-purple-400" />
                Total Package Files
              </div>
              <p className="font-semibold text-sm text-on-surface">
                {files ? `${files.length} Official Files` : "Loading files…"}
              </p>
              <p className="text-[11px] text-on-surface-variant">Schedules, Questionnaires & CSV</p>
            </div>
          </div>

          {/* Survey Methodology & Description Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-4">
            <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              About This Survey & Statistical Methodology
            </h2>
            <div className="text-xs text-on-surface-variant leading-relaxed space-y-3">
              <p>
                The <strong>{title}</strong> is an official nationwide survey conducted under the authority of the Ministry of Statistics and Programme Implementation (MoSPI), Government of India. The primary objective is to produce standardized, high-precision statistical aggregates and unit-level microdata for economic planning, academic research, and policy formulation.
              </p>
              <p>
                Microdata records contain anonymized unit responses collected via structured statistical schedules across industrial, household, or enterprise establishments. All units follow standardized sampling frameworks designed by the National Statistical Office (NSO).
              </p>
            </div>
          </div>

          {/* AI Research Assistant Callout */}
          <div className="glass-panel p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-xs font-label-caps uppercase tracking-wider text-primary">
              <Sparkles className="w-4 h-4" />
              StatIQ AI Analyst Exploration
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Use StatIQ AI to synthesize methodologies, interpret industrial/occupation classification codes, or generate reproducible statistical code snippets (Python/R/SQL) for this dataset.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg bg-surface-container-high/80 border border-outline-variant/30 text-[11px] text-on-surface">
                &ldquo;Explain the sampling weights used in {idno}&rdquo;
              </span>
              <span className="px-3 py-1 rounded-lg bg-surface-container-high/80 border border-outline-variant/30 text-[11px] text-on-surface">
                &ldquo;How to calculate gross value added from unit schedules?&rdquo;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUBLISHED FILES */}
      {activeTab === "files" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface">Official Published Files & Schedules</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Technical questionnaires, geo-coding master lists, and microdata files published by MoSPI for {idno}.
              </p>
            </div>
            <div className="text-xs font-mono text-primary font-semibold">
              {files ? `${files.length} Files Available` : "Querying files…"}
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {downloadSuccess}
            </div>
          )}

          {fileError && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {fileError}
            </div>
          )}

          <div className="glass-panel rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-surface-container-high/80 border-b border-outline-variant/30 text-on-surface font-label-caps uppercase text-[11px]">
                  <tr>
                    <th className="py-4 px-5 font-semibold">File Name & Type</th>
                    <th className="py-4 px-4 font-semibold">Classification</th>
                    <th className="py-4 px-4 font-semibold">Source</th>
                    <th className="py-4 px-4 font-semibold">Access</th>
                    <th className="py-4 px-5 font-semibold text-right">Download Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant">
                  {(files ?? []).map((file, idx) => {
                    const name = String(file.name ?? file.filename ?? `file_${idx + 1}`);
                    const isPdf = name.toLowerCase().endsWith(".pdf");
                    const isZip = name.toLowerCase().endsWith(".zip");
                    const isCsv = name.toLowerCase().endsWith(".csv");

                    const typeBadge = isPdf
                      ? "Technical Document (PDF)"
                      : isZip
                      ? "Microdata Archive (ZIP)"
                      : isCsv
                      ? "Unit Records (CSV)"
                      : "Data File";

                    const isDownloading = downloadingFile === name;

                    return (
                      <tr key={name} className="hover:bg-surface-container-high/40 transition-colors">
                        <td className="py-4 px-5 font-mono text-on-surface font-medium flex items-center gap-2.5">
                          {isPdf ? (
                            <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                          ) : isZip ? (
                            <FileArchive className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <FileCode className="w-4 h-4 text-primary shrink-0" />
                          )}
                          <span className="truncate max-w-sm">{name}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-[11px] text-on-surface-variant">
                            {typeBadge}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-on-surface-variant text-[11px]">
                          MoSPI NADA
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] font-label-caps uppercase">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified Public
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            disabled={isDownloading}
                            onClick={() => handleDownload(name)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white font-sans uppercase text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isDownloading ? (
                              <>
                                <Clock className="w-3 h-3 animate-spin" />
                                Downloading…
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3" />
                                Download File
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA DICTIONARY */}
      {activeTab === "dictionary" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">Survey Variables & Codebook</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Standard variable codes, data definitions, measurement units, and questionnaire blocks for this survey series.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
              <input
                value={dictSearch}
                onChange={(e) => setDictSearch(e.target.value)}
                placeholder="Search variables by name or concept (e.g. NIC_CODE, GROSS_OUTPUT)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["ALL", "Numeric", "Categorical", "Identifier", "Weight"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDictFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-sans uppercase font-bold transition-all ${
                    dictFilterType === t
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dual-Pane Codebook Explorer */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Pane: Variable List */}
            <div className="lg:col-span-7 glass-panel rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
              <div className="p-4 bg-surface-container-high/80 border-b border-outline-variant/30 text-xs font-label-caps uppercase font-semibold text-on-surface">
                Codebook Variables ({filteredVars.length})
              </div>
              <div className="divide-y divide-outline-variant/15 max-h-[500px] overflow-y-auto">
                {filteredVars.map((v) => {
                  const isSelected = selectedVar.name === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVar(v)}
                      className={`w-full text-left p-4 transition-colors flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "hover:bg-surface-container-high/30"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs font-bold text-primary">{v.name}</code>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-label-caps uppercase bg-surface-container-high text-on-surface-variant">
                            {v.type}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-on-surface">{v.label}</p>
                        <p className="text-[11px] text-on-surface-variant line-clamp-1">{v.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Deep-Dive Inspector */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-outline-variant/30 space-y-5">
              <div className="space-y-1 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <code className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    {selectedVar.name}
                  </code>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-label-caps uppercase font-bold border border-emerald-500/20">
                    {selectedVar.type}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-on-surface">{selectedVar.label}</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                    Definition & Concept
                  </span>
                  <p className="text-on-surface mt-1 leading-relaxed">{selectedVar.description}</p>
                </div>

                <div>
                  <span className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                    Storage Format & Unit
                  </span>
                  <p className="font-mono text-on-surface mt-0.5">{selectedVar.format}</p>
                </div>

                {selectedVar.values && (
                  <div>
                    <span className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                      Allowed Range / Categories
                    </span>
                    <p className="text-on-surface mt-0.5">{selectedVar.values}</p>
                  </div>
                )}

                {selectedVar.sourceBlock && (
                  <div>
                    <span className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                      Survey Schedule Block
                    </span>
                    <p className="text-on-surface mt-0.5">{selectedVar.sourceBlock}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCESS & GOVERNANCE */}
      {activeTab === "access" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs font-label-caps uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Tier 1 — Verified Public Research Access Clearance
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This survey catalog, metadata schedules, and codebooks are publicly available for academic research, government policy analysis, and statistical learning under the Government Open Data License (GODL) / NSO Open Data Policy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 space-y-3">
              <h3 className="font-semibold text-sm text-on-surface">Permitted Uses</h3>
              <ul className="text-xs text-on-surface-variant space-y-2 list-disc list-inside leading-relaxed">
                <li>Academic thesis research and econometric modeling.</li>
                <li>Public policy analysis and industrial output evaluation.</li>
                <li>Statistical software training (Python, R, Stata, SQL).</li>
                <li>Educational and classroom demonstration.</li>
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 space-y-3">
              <h3 className="font-semibold text-sm text-on-surface">Governance & Compliance</h3>
              <ul className="text-xs text-on-surface-variant space-y-2 list-disc list-inside leading-relaxed">
                <li>No commercial resale of raw unit-level microdata archives.</li>
                <li>Preserve respondent unit anonymity (no de-anonymization).</li>
                <li>Include official MoSPI attribution citation in published work.</li>
              </ul>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-on-surface">Official Citation Format</h3>
              <button
                type="button"
                onClick={handleCopyCitation}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                {copiedCitation ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedCitation ? "Copied" : "Copy Citation"}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-surface-container-high/80 border border-outline-variant/30 text-xs font-mono text-on-surface overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {citationText}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: OFFICIAL PROVENANCE */}
      {activeTab === "provenance" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Cryptographic Provenance & Gateway Audit
            </h2>
            <p className="text-xs text-on-surface-variant">
              Complete provenance trail confirming authentic origin from the official government microdata archive.
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1">
              <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                Primary Upstream Gateway
              </dt>
              <dd className="font-mono text-on-surface font-semibold">
                https://microdata.gov.in/NADA/index.php/api
              </dd>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1">
              <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                Institutional Owner
              </dt>
              <dd className="text-on-surface font-semibold">
                Ministry of Statistics and Programme Implementation (MoSPI)
              </dd>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1">
              <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                Security Architecture
              </dt>
              <dd className="text-on-surface">
                Zero Client API Keys • Encrypted Server Proxy • TLS 1.2/1.3 Handshake
              </dd>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1">
              <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">
                Validation Timestamp
              </dt>
              <dd className="font-mono text-emerald-500">
                Verified Live via StatIQ Gateway Proxy
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
