import type { OfficialDataset, OfficialRecord } from "@/db/official-store";

export interface ThematicDatasetSeed {
  dataset: OfficialDataset;
  sampleRecords: OfficialRecord[];
}

export const OFFICIAL_THEMATIC_DATASETS: ThematicDatasetSeed[] = [
  // 1. WPI
  {
    dataset: {
      id: "ds-wpi",
      name: "Wholesale Price Index (WPI)",
      source: "MoSPI API Platform",
      sourceUrl: "https://api.mospi.gov.in",
      category: "Prices",
      description: "Wholesale Price Index measures wholesale transaction prices of representative commodities across Manufactured Products, Primary Articles, and Fuel & Power.",
      frequency: "Monthly",
      referencePeriod: "2024-2025 (Base 2011-12=100)",
      lastUpdated: new Date().toISOString(),
      recordCount: 9,
      accessType: "authenticated API (live-proxied)",
      theme: "WPI",
      externalId: "wpi",
    },
    sampleRecords: [
      { id: "wpi-1", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-01-mfg", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", majorgroup: "Manufactured Products", group: "Basic Metals", item: "Mild Steel", index_value: 154.2, weight: 2.58 } },
      { id: "wpi-2", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-02-mfg", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "February", majorgroup: "Manufactured Products", group: "Basic Metals", item: "Mild Steel", index_value: 155.8, weight: 2.58 } },
      { id: "wpi-3", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-03-mfg", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "March", majorgroup: "Manufactured Products", group: "Basic Metals", item: "Mild Steel", index_value: 156.4, weight: 2.58 } },
      { id: "wpi-4", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-01-pri", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", majorgroup: "Primary Articles", group: "Food Articles", item: "Paddy / Rice", index_value: 172.6, weight: 1.54 } },
      { id: "wpi-5", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-02-pri", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "February", majorgroup: "Primary Articles", group: "Food Articles", item: "Paddy / Rice", index_value: 174.1, weight: 1.54 } },
      { id: "wpi-6", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-03-pri", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "March", majorgroup: "Primary Articles", group: "Food Articles", item: "Paddy / Rice", index_value: 175.9, weight: 1.54 } },
      { id: "wpi-7", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-01-fuel", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", majorgroup: "Fuel & Power", group: "Mineral Oils", item: "High Speed Diesel", index_value: 148.9, weight: 3.10 } },
      { id: "wpi-8", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-02-fuel", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "February", majorgroup: "Fuel & Power", group: "Mineral Oils", item: "High Speed Diesel", index_value: 149.5, weight: 3.10 } },
      { id: "wpi-9", datasetId: "ds-wpi", source: "MoSPI API Platform", sourceUrl: "https://api.mospi.gov.in", externalId: "wpi-2025-03-fuel", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "March", majorgroup: "Fuel & Power", group: "Mineral Oils", item: "High Speed Diesel", index_value: 151.2, weight: 3.10 } },
    ],
  },

  // 2. CPI
  {
    dataset: {
      id: "ds-cpi",
      name: "Consumer Price Index (CPI)",
      source: "National Statistical Office (NSO)",
      sourceUrl: "https://mospi.gov.in/cpi",
      category: "Prices",
      description: "Consumer Price Index measures changes over time in the general level of prices of goods and services that a reference population acquires for consumption.",
      frequency: "Monthly",
      referencePeriod: "2024-2025 (Base 2012=100)",
      lastUpdated: new Date().toISOString(),
      recordCount: 20,
      accessType: "authenticated API",
      theme: "CPI",
      externalId: "cpi",
    },
    sampleRecords: [
      { id: "cpi-1", datasetId: "ds-cpi", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/cpi", externalId: "cpi-gen-2025-01", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "Combined", category: "General Index (All Groups)", index_value: 189.4, inflation_rate: 4.31, weight: 100.0 } },
      { id: "cpi-2", datasetId: "ds-cpi", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/cpi", externalId: "cpi-gen-2025-02", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "February", sector: "Combined", category: "General Index (All Groups)", index_value: 190.2, inflation_rate: 4.18, weight: 100.0 } },
      { id: "cpi-3", datasetId: "ds-cpi", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/cpi", externalId: "cpi-gen-2025-03", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "March", sector: "Combined", category: "General Index (All Groups)", index_value: 191.0, inflation_rate: 4.25, weight: 100.0 } },
      { id: "cpi-4", datasetId: "ds-cpi", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/cpi", externalId: "cpi-food-2025-01", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "Rural", category: "Food and Beverages", index_value: 196.8, inflation_rate: 5.42, weight: 54.18 } },
      { id: "cpi-5", datasetId: "ds-cpi", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/cpi", externalId: "cpi-food-2025-02", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "February", sector: "Rural", category: "Food and Beverages", index_value: 197.4, inflation_rate: 5.15, weight: 54.18 } },
      { id: "cpi-6", datasetId: "ds-cpi", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/cpi", externalId: "cpi-urban-2025-01", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "Urban", category: "Housing & Transport", index_value: 178.5, inflation_rate: 3.82, weight: 36.25 } },
      { id: "cpi-7", datasetId: "ds-cpi", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/cpi", externalId: "cpi-urban-2025-02", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "February", sector: "Urban", category: "Housing & Transport", index_value: 179.1, inflation_rate: 3.75, weight: 36.25 } },
    ],
  },

  // 3. PLFS
  {
    dataset: {
      id: "ds-plfs",
      name: "Periodic Labour Force Survey (PLFS)",
      source: "National Sample Survey Office (NSSO)",
      sourceUrl: "https://mospi.gov.in/plfs",
      category: "Labour",
      description: "Official nationwide labour statistics measuring Labour Force Participation Rate (LFPR), Worker Population Ratio (WPR), and Unemployment Rate (UR) across rural and urban India.",
      frequency: "Quarterly / Annual",
      referencePeriod: "2023-2024 (Annual Series)",
      lastUpdated: new Date().toISOString(),
      recordCount: 25,
      accessType: "authenticated API",
      theme: "PLFS",
      externalId: "plfs",
    },
    sampleRecords: [
      { id: "plfs-1", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-all-india", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "All India", sector: "Combined", gender: "Total", lfpr_percentage: 60.1, wpr_percentage: 58.2, unemployment_rate: 3.1, sample_households: 101844 } },
      { id: "plfs-2", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-rural-male", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "Rural", sector: "Rural", gender: "Male", lfpr_percentage: 80.2, wpr_percentage: 78.1, unemployment_rate: 2.6, sample_households: 55420 } },
      { id: "plfs-3", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-rural-female", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "Rural", sector: "Rural", gender: "Female", lfpr_percentage: 44.8, wpr_percentage: 43.6, unemployment_rate: 2.7, sample_households: 55420 } },
      { id: "plfs-4", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-urban-male", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "Urban", sector: "Urban", gender: "Male", lfpr_percentage: 74.8, wpr_percentage: 70.9, unemployment_rate: 5.2, sample_households: 46424 } },
      { id: "plfs-5", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-urban-female", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "Urban", sector: "Urban", gender: "Female", lfpr_percentage: 26.2, wpr_percentage: 24.3, unemployment_rate: 7.2, sample_households: 46424 } },
      { id: "plfs-6", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-state-mh", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "Maharashtra", sector: "Combined", gender: "Total", lfpr_percentage: 61.4, wpr_percentage: 59.5, unemployment_rate: 3.0, sample_households: 9200 } },
      { id: "plfs-7", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-state-up", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "Uttar Pradesh", sector: "Combined", gender: "Total", lfpr_percentage: 56.8, wpr_percentage: 55.2, unemployment_rate: 2.8, sample_households: 14200 } },
      { id: "plfs-8", datasetId: "ds-plfs", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/plfs", externalId: "plfs-state-ka", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", region: "Karnataka", sector: "Combined", gender: "Total", lfpr_percentage: 62.0, wpr_percentage: 60.5, unemployment_rate: 2.4, sample_households: 8100 } },
    ],
  },

  // 4. IIP
  {
    dataset: {
      id: "ds-iip",
      name: "Index of Industrial Production (IIP)",
      source: "National Statistical Office (NSO)",
      sourceUrl: "https://mospi.gov.in/iip",
      category: "Industry",
      description: "Index of Industrial Production details the volume of production in industrial sectors comprising Mining, Manufacturing, and Electricity generation in India.",
      frequency: "Monthly",
      referencePeriod: "2024-2025 (Base 2011-12=100)",
      lastUpdated: new Date().toISOString(),
      recordCount: 18,
      accessType: "authenticated API",
      theme: "IIP",
      externalId: "iip",
    },
    sampleRecords: [
      { id: "iip-1", datasetId: "ds-iip", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/iip", externalId: "iip-2025-01-gen", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "General Index", use_based_category: "Overall", index_value: 153.8, growth_rate: 5.2, weight: 100.0 } },
      { id: "iip-2", datasetId: "ds-iip", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/iip", externalId: "iip-2025-02-gen", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "February", sector: "General Index", use_based_category: "Overall", index_value: 154.6, growth_rate: 4.8, weight: 100.0 } },
      { id: "iip-3", datasetId: "ds-iip", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/iip", externalId: "iip-2025-01-mfg", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "Manufacturing", use_based_category: "Sectoral", index_value: 150.2, growth_rate: 4.6, weight: 77.63 } },
      { id: "iip-4", datasetId: "ds-iip", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/iip", externalId: "iip-2025-01-min", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "Mining", use_based_category: "Sectoral", index_value: 144.1, growth_rate: 6.8, weight: 14.37 } },
      { id: "iip-5", datasetId: "ds-iip", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/iip", externalId: "iip-2025-01-elec", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "Electricity", use_based_category: "Sectoral", index_value: 188.5, growth_rate: 7.9, weight: 7.99 } },
      { id: "iip-6", datasetId: "ds-iip", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/iip", externalId: "iip-2025-01-cap", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", sector: "Capital Goods", use_based_category: "Use-Based", index_value: 112.4, growth_rate: 8.4, weight: 8.28 } },
    ],
  },

  // 5. NAS (National Accounts Statistics)
  {
    dataset: {
      id: "ds-nas",
      name: "National Accounts Statistics (GDP & GVA)",
      source: "National Accounts Division (NAD)",
      sourceUrl: "https://mospi.gov.in/national-accounts",
      category: "Economy",
      description: "Official National Accounts Statistics estimating Gross Domestic Product (GDP), Gross Value Added (GVA), capital formation, and sectoral economic growth rates.",
      frequency: "Quarterly / Annual",
      referencePeriod: "2023-2024 (Base 2011-12)",
      lastUpdated: new Date().toISOString(),
      recordCount: 16,
      accessType: "authenticated API",
      theme: "NAS",
      externalId: "nas",
    },
    sampleRecords: [
      { id: "nas-1", datasetId: "ds-nas", source: "NAD MoSPI", sourceUrl: "https://mospi.gov.in/national-accounts", externalId: "nas-gdp-2024-q3", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q3", component: "Real GDP at Constant Prices", sector: "All Economic Activities", value_crore_inr: 4372400, growth_rate_yoy: 7.8 } },
      { id: "nas-2", datasetId: "ds-nas", source: "NAD MoSPI", sourceUrl: "https://mospi.gov.in/national-accounts", externalId: "nas-gdp-2024-q4", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", component: "Real GDP at Constant Prices", sector: "All Economic Activities", value_crore_inr: 4724100, growth_rate_yoy: 8.2 } },
      { id: "nas-3", datasetId: "ds-nas", source: "NAD MoSPI", sourceUrl: "https://mospi.gov.in/national-accounts", externalId: "nas-gva-mfg", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", component: "GVA at Basic Prices", sector: "Manufacturing", value_crore_inr: 785400, growth_rate_yoy: 8.9 } },
      { id: "nas-4", datasetId: "ds-nas", source: "NAD MoSPI", sourceUrl: "https://mospi.gov.in/national-accounts", externalId: "nas-gva-serv", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", component: "GVA at Basic Prices", sector: "Financial, Real Estate & Professional", value_crore_inr: 964200, growth_rate_yoy: 7.6 } },
      { id: "nas-5", datasetId: "ds-nas", source: "NAD MoSPI", sourceUrl: "https://mospi.gov.in/national-accounts", externalId: "nas-gva-agri", retrievedAt: new Date().toISOString(), payload: { year: "2024", quarter: "Q4", component: "GVA at Basic Prices", sector: "Agriculture, Forestry & Fishing", value_crore_inr: 684200, growth_rate_yoy: 2.1 } },
    ],
  },

  // 6. ASI (Annual Survey of Industries)
  {
    dataset: {
      id: "ds-asi",
      name: "Annual Survey of Industries (ASI)",
      source: "Industrial Statistics Wing (ISW)",
      sourceUrl: "https://mospi.gov.in/asi",
      category: "Industry",
      description: "Principal source of industrial statistics in India covering registered factories under the Factories Act, 1948, providing insights into employment, capital, and gross output.",
      frequency: "Annual",
      referencePeriod: "2022-2023",
      lastUpdated: new Date().toISOString(),
      recordCount: 15,
      accessType: "authenticated API",
      theme: "ASI",
      externalId: "asi",
    },
    sampleRecords: [
      { id: "asi-1", datasetId: "ds-asi", source: "ISW MoSPI", sourceUrl: "https://mospi.gov.in/asi", externalId: "asi-all-india", retrievedAt: new Date().toISOString(), payload: { year: "2023", industry_division: "All Industries (NIC 2-digit)", factories_operating: 253000, persons_engaged: 17200000, fixed_capital_crore: 4210000, gross_output_crore: 10450000, net_value_added_crore: 1845000 } },
      { id: "asi-2", datasetId: "ds-asi", source: "ISW MoSPI", sourceUrl: "https://mospi.gov.in/asi", externalId: "asi-auto", retrievedAt: new Date().toISOString(), payload: { year: "2023", industry_division: "Motor Vehicles & Trailers (NIC 29)", factories_operating: 9400, persons_engaged: 1420000, fixed_capital_crore: 412000, gross_output_crore: 1240000, net_value_added_crore: 234000 } },
      { id: "asi-3", datasetId: "ds-asi", source: "ISW MoSPI", sourceUrl: "https://mospi.gov.in/asi", externalId: "asi-pharma", retrievedAt: new Date().toISOString(), payload: { year: "2023", industry_division: "Pharmaceuticals & Botanical (NIC 21)", factories_operating: 6200, persons_engaged: 890000, fixed_capital_crore: 284000, gross_output_crore: 582000, net_value_added_crore: 145000 } },
      { id: "asi-4", datasetId: "ds-asi", source: "ISW MoSPI", sourceUrl: "https://mospi.gov.in/asi", externalId: "asi-textile", retrievedAt: new Date().toISOString(), payload: { year: "2023", industry_division: "Textiles & Wearing Apparel (NIC 13-14)", factories_operating: 34100, persons_engaged: 2980000, fixed_capital_crore: 215000, gross_output_crore: 642000, net_value_added_crore: 98000 } },
    ],
  },

  // 7. Energy Statistics
  {
    dataset: {
      id: "ds-energy",
      name: "Energy Statistics India",
      source: "Social Statistics Division (SSD)",
      sourceUrl: "https://mospi.gov.in/energy-statistics",
      category: "Energy",
      description: "Comprehensive national compilation on reserves, installed capacity, potential, production, consumption, and foreign trade of energy commodities in India.",
      frequency: "Annual",
      referencePeriod: "2023-2024",
      lastUpdated: new Date().toISOString(),
      recordCount: 14,
      accessType: "authenticated API",
      theme: "ENERGY",
      externalId: "energy",
    },
    sampleRecords: [
      { id: "energy-1", datasetId: "ds-energy", source: "SSD MoSPI", sourceUrl: "https://mospi.gov.in/energy-statistics", externalId: "energy-total-cap", retrievedAt: new Date().toISOString(), payload: { year: "2024", source_type: "Total Grid Capacity", installed_capacity_gw: 442.8, generation_twh: 1739.0, renewable_share_pct: 43.1 } },
      { id: "energy-2", datasetId: "ds-energy", source: "SSD MoSPI", sourceUrl: "https://mospi.gov.in/energy-statistics", externalId: "energy-solar", retrievedAt: new Date().toISOString(), payload: { year: "2024", source_type: "Solar Energy", installed_capacity_gw: 82.6, generation_twh: 115.8, renewable_share_pct: 18.7 } },
      { id: "energy-3", datasetId: "ds-energy", source: "SSD MoSPI", sourceUrl: "https://mospi.gov.in/energy-statistics", externalId: "energy-wind", retrievedAt: new Date().toISOString(), payload: { year: "2024", source_type: "Wind Power", installed_capacity_gw: 45.8, generation_twh: 82.4, renewable_share_pct: 10.3 } },
      { id: "energy-4", datasetId: "ds-energy", source: "SSD MoSPI", sourceUrl: "https://mospi.gov.in/energy-statistics", externalId: "energy-thermal", retrievedAt: new Date().toISOString(), payload: { year: "2024", source_type: "Thermal (Coal/Lignite/Gas)", installed_capacity_gw: 243.2, generation_twh: 1294.0, renewable_share_pct: 54.9 } },
    ],
  },

  // 8. AISHE (Higher Education Survey)
  {
    dataset: {
      id: "ds-aishe",
      name: "All India Survey on Higher Education (AISHE)",
      source: "Ministry of Education / MoSPI",
      sourceUrl: "https://aishe.gov.in",
      category: "Education",
      description: "Official survey detailing universities, colleges, student enrolment, faculty count, Gross Enrolment Ratio (GER), and gender parity across Indian higher education institutions.",
      frequency: "Annual",
      referencePeriod: "2021-2022 / 2022-2023",
      lastUpdated: new Date().toISOString(),
      recordCount: 12,
      accessType: "authenticated API",
      theme: "AISHE",
      externalId: "aishe",
    },
    sampleRecords: [
      { id: "aishe-1", datasetId: "ds-aishe", source: "MoE / AISHE", sourceUrl: "https://aishe.gov.in", externalId: "aishe-national", retrievedAt: new Date().toISOString(), payload: { year: "2022-23", level: "All India Total", total_enrolment_lakh: 433.0, female_enrolment_lakh: 207.0, ger_total_pct: 28.4, ger_female_pct: 28.5, pupil_teacher_ratio: 24.0, universities_count: 1168, colleges_count: 45473 } },
      { id: "aishe-2", datasetId: "ds-aishe", source: "MoE / AISHE", sourceUrl: "https://aishe.gov.in", externalId: "aishe-ug", retrievedAt: new Date().toISOString(), payload: { year: "2022-23", level: "Undergraduate (UG)", total_enrolment_lakh: 341.0, female_enrolment_lakh: 161.0, ger_total_pct: 24.8, ger_female_pct: 24.9, pupil_teacher_ratio: 22.0, universities_count: 1168, colleges_count: 45473 } },
      { id: "aishe-3", datasetId: "ds-aishe", source: "MoE / AISHE", sourceUrl: "https://aishe.gov.in", externalId: "aishe-pg", retrievedAt: new Date().toISOString(), payload: { year: "2022-23", level: "Postgraduate (PG)", total_enrolment_lakh: 48.0, female_enrolment_lakh: 27.5, ger_total_pct: 3.8, ger_female_pct: 4.2, pupil_teacher_ratio: 16.0, universities_count: 1168, colleges_count: 45473 } },
    ],
  },

  // 9. ASUSE (Unincorporated Sector)
  {
    dataset: {
      id: "ds-asuse",
      name: "Annual Survey of Unincorporated Sector Enterprises (ASUSE)",
      source: "National Sample Survey Office (NSSO)",
      sourceUrl: "https://mospi.gov.in/asuse",
      category: "Economy",
      description: "Survey covering unincorporated non-agricultural enterprises in manufacturing, trade, and other services sectors in rural and urban areas.",
      frequency: "Annual",
      referencePeriod: "2022-2023",
      lastUpdated: new Date().toISOString(),
      recordCount: 10,
      accessType: "authenticated API",
      theme: "ASUSE",
      externalId: "asuse",
    },
    sampleRecords: [
      { id: "asuse-1", datasetId: "ds-asuse", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/asuse", externalId: "asuse-all-india", retrievedAt: new Date().toISOString(), payload: { year: "2023", sector: "All Unincorporated", enterprise_count_crore: 6.50, workers_count_crore: 10.96, gva_per_enterprise_inr: 241500, gva_total_crore: 1569700 } },
      { id: "asuse-2", datasetId: "ds-asuse", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/asuse", externalId: "asuse-mfg", retrievedAt: new Date().toISOString(), payload: { year: "2023", sector: "Manufacturing", enterprise_count_crore: 1.84, workers_count_crore: 3.65, gva_per_enterprise_inr: 224000, gva_total_crore: 412100 } },
      { id: "asuse-3", datasetId: "ds-asuse", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/asuse", externalId: "asuse-trade", retrievedAt: new Date().toISOString(), payload: { year: "2023", sector: "Trade", enterprise_count_crore: 2.38, workers_count_crore: 3.82, gva_per_enterprise_inr: 268000, gva_total_crore: 637800 } },
    ],
  },

  // 10. Gender Statistics
  {
    dataset: {
      id: "ds-gender",
      name: "Gender Statistics & Development Indicators",
      source: "Social Statistics Division (SSD)",
      sourceUrl: "https://mospi.gov.in/gender-statistics",
      category: "Social",
      description: "Official gender statistics compilation presenting critical dimensions of gender development, sex ratio, workforce participation, and social indicators.",
      frequency: "Annual",
      referencePeriod: "2023-2024",
      lastUpdated: new Date().toISOString(),
      recordCount: 12,
      accessType: "authenticated API",
      theme: "GENDER",
      externalId: "gender",
    },
    sampleRecords: [
      { id: "gender-1", datasetId: "ds-gender", source: "SSD MoSPI", sourceUrl: "https://mospi.gov.in/gender-statistics", externalId: "gender-sr", retrievedAt: new Date().toISOString(), payload: { year: "2024", indicator: "Sex Ratio at Birth (SRB)", domain: "Demography", national_value: 907, rural_value: 908, urban_value: 905, target_sdg: 950 } },
      { id: "gender-2", datasetId: "ds-gender", source: "SSD MoSPI", sourceUrl: "https://mospi.gov.in/gender-statistics", externalId: "gender-lfpr", retrievedAt: new Date().toISOString(), payload: { year: "2024", indicator: "Female LFPR (15+ Years)", domain: "Economic Participation", national_value: 41.7, rural_value: 46.7, urban_value: 28.0, target_sdg: 50.0 } },
      { id: "gender-3", datasetId: "ds-gender", source: "SSD MoSPI", sourceUrl: "https://mospi.gov.in/gender-statistics", externalId: "gender-bank", retrievedAt: new Date().toISOString(), payload: { year: "2024", indicator: "Women with Bank Accounts (%)", domain: "Financial Inclusion", national_value: 78.6, rural_value: 77.2, urban_value: 81.4, target_sdg: 100.0 } },
    ],
  },

  // 11. NFHS (National Family Health Survey)
  {
    dataset: {
      id: "ds-nfhs",
      name: "National Family Health Survey (NFHS-5)",
      source: "IIPS / Ministry of Health & Family Welfare",
      sourceUrl: "https://dhsprogram.com/pubs/pdf/FR375/FR375.pdf",
      category: "Health",
      description: "Large-scale, multi-round survey providing state and national information on fertility, infant and child mortality, family planning, maternal and child health, and nutrition.",
      frequency: "Round-wise (NFHS-5)",
      referencePeriod: "2019-2021",
      lastUpdated: new Date().toISOString(),
      recordCount: 15,
      accessType: "authenticated API",
      theme: "NFHS",
      externalId: "nfhs",
    },
    sampleRecords: [
      { id: "nfhs-1", datasetId: "ds-nfhs", source: "MoHFW / IIPS", sourceUrl: "https://rchiips.org/nfhs", externalId: "nfhs-tfr", retrievedAt: new Date().toISOString(), payload: { indicator: "Total Fertility Rate (TFR)", category: "Fertility", total_rate: 2.0, rural_rate: 2.1, urban_rate: 1.6, nfhs4_baseline: 2.2 } },
      { id: "nfhs-2", datasetId: "ds-nfhs", source: "MoHFW / IIPS", sourceUrl: "https://rchiips.org/nfhs", externalId: "nfhs-inst-deliv", retrievedAt: new Date().toISOString(), payload: { indicator: "Institutional Births (%)", category: "Maternal Health", total_rate: 88.6, rural_rate: 86.7, urban_rate: 93.8, nfhs4_baseline: 78.9 } },
      { id: "nfhs-3", datasetId: "ds-nfhs", source: "MoHFW / IIPS", sourceUrl: "https://rchiips.org/nfhs", externalId: "nfhs-immun", retrievedAt: new Date().toISOString(), payload: { indicator: "Full Immunization Coverage (%)", category: "Child Health", total_rate: 76.4, rural_rate: 76.8, urban_rate: 75.5, nfhs4_baseline: 62.0 } },
      { id: "nfhs-4", datasetId: "ds-nfhs", source: "MoHFW / IIPS", sourceUrl: "https://rchiips.org/nfhs", externalId: "nfhs-stunting", retrievedAt: new Date().toISOString(), payload: { indicator: "Children Stunted under 5 Years (%)", category: "Nutrition", total_rate: 35.5, rural_rate: 37.3, urban_rate: 30.1, nfhs4_baseline: 38.4 } },
    ],
  },

  // 12. UDISE+ School Education
  {
    dataset: {
      id: "ds-udise",
      name: "UDISE+ Unified District School Information",
      source: "Department of School Education & Literacy (DoSEL)",
      sourceUrl: "https://udiseplus.gov.in",
      category: "Education",
      description: "Comprehensive national database covering 1.48 million schools, 265 million students, and 9.5 million teachers across India.",
      frequency: "Annual",
      referencePeriod: "2022-2023",
      lastUpdated: new Date().toISOString(),
      recordCount: 12,
      accessType: "authenticated API",
      theme: "UDISE",
      externalId: "udise",
    },
    sampleRecords: [
      { id: "udise-1", datasetId: "ds-udise", source: "DoSEL MoE", sourceUrl: "https://udiseplus.gov.in", externalId: "udise-all-india", retrievedAt: new Date().toISOString(), payload: { year: "2023", level: "All India Total", total_schools: 1489115, total_enrolment_crore: 26.52, total_teachers_lakh: 95.0, ptr_primary: 26.0, ptr_upper_primary: 19.0, electricity_pct: 89.3, drinking_water_pct: 98.2 } },
      { id: "udise-2", datasetId: "ds-udise", source: "DoSEL MoE", sourceUrl: "https://udiseplus.gov.in", externalId: "udise-gov-schools", retrievedAt: new Date().toISOString(), payload: { year: "2023", level: "Government Schools", total_schools: 1022386, total_enrolment_crore: 14.32, total_teachers_lakh: 48.8, ptr_primary: 24.0, ptr_upper_primary: 17.0, electricity_pct: 87.1, drinking_water_pct: 98.0 } },
      { id: "udise-3", datasetId: "ds-udise", source: "DoSEL MoE", sourceUrl: "https://udiseplus.gov.in", externalId: "udise-pvt-schools", retrievedAt: new Date().toISOString(), payload: { year: "2023", level: "Private Unaided Schools", total_schools: 337499, total_enrolment_crore: 8.84, total_teachers_lakh: 35.1, ptr_primary: 29.0, ptr_upper_primary: 22.0, electricity_pct: 97.4, drinking_water_pct: 99.1 } },
    ],
  },

  // 13. MNRE Renewable Energy
  {
    dataset: {
      id: "ds-mnre",
      name: "MNRE Renewable Energy Installed Capacity",
      source: "Ministry of New & Renewable Energy (MNRE)",
      sourceUrl: "https://mnre.gov.in",
      category: "Energy",
      description: "Official monthly progress reports on grid-interactive and off-grid renewable power installed capacity across Indian states and union territories.",
      frequency: "Monthly",
      referencePeriod: "2024-2025",
      lastUpdated: new Date().toISOString(),
      recordCount: 15,
      accessType: "authenticated API",
      theme: "MNRE",
      externalId: "mnre",
    },
    sampleRecords: [
      { id: "mnre-1", datasetId: "ds-mnre", source: "MNRE", sourceUrl: "https://mnre.gov.in", externalId: "mnre-solar-ground", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", technology: "Solar Power (Ground Mounted)", installed_mw: 64200.0, monthly_addition_mw: 1420.0, share_pct: 42.8 } },
      { id: "mnre-2", datasetId: "ds-mnre", source: "MNRE", sourceUrl: "https://mnre.gov.in", externalId: "mnre-solar-roof", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", technology: "Solar Power (Rooftop Grid)", installed_mw: 18400.0, monthly_addition_mw: 680.0, share_pct: 12.3 } },
      { id: "mnre-3", datasetId: "ds-mnre", source: "MNRE", sourceUrl: "https://mnre.gov.in", externalId: "mnre-wind", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", technology: "Wind Power", installed_mw: 46800.0, monthly_addition_mw: 310.0, share_pct: 31.2 } },
      { id: "mnre-4", datasetId: "ds-mnre", source: "MNRE", sourceUrl: "https://mnre.gov.in", externalId: "mnre-bio", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", technology: "Bio-Power / Cogeneration", installed_mw: 10800.0, monthly_addition_mw: 24.0, share_pct: 7.2 } },
      { id: "mnre-5", datasetId: "ds-mnre", source: "MNRE", sourceUrl: "https://mnre.gov.in", externalId: "mnre-hydro", retrievedAt: new Date().toISOString(), payload: { year: "2025", month: "January", technology: "Small Hydro Power", installed_mw: 4980.0, monthly_addition_mw: 12.0, share_pct: 3.3 } },
    ],
  },

  // 14. TUS (Time Use Survey)
  {
    dataset: {
      id: "ds-tus",
      name: "All India Time Use Survey (TUS)",
      source: "National Statistical Office (NSO)",
      sourceUrl: "https://mospi.gov.in/time-use-survey",
      category: "Social",
      description: "First national survey on time use quantifying the participation rate and time spent on paid, unpaid, domestic, learning, and socializing activities.",
      frequency: "Multi-year round",
      referencePeriod: "2019-2020 / Round Series",
      lastUpdated: new Date().toISOString(),
      recordCount: 12,
      accessType: "authenticated API",
      theme: "TUS",
      externalId: "tus",
    },
    sampleRecords: [
      { id: "tus-1", datasetId: "ds-tus", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/time-use-survey", externalId: "tus-unpaid-female", retrievedAt: new Date().toISOString(), payload: { activity_group: "Unpaid Domestic Services for Household", gender: "Female", participation_pct: 81.2, avg_minutes_per_day: 299, hours_per_day: 5.0 } },
      { id: "tus-2", datasetId: "ds-tus", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/time-use-survey", externalId: "tus-unpaid-male", retrievedAt: new Date().toISOString(), payload: { activity_group: "Unpaid Domestic Services for Household", gender: "Male", participation_pct: 26.1, avg_minutes_per_day: 97, hours_per_day: 1.6 } },
      { id: "tus-3", datasetId: "ds-tus", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/time-use-survey", externalId: "tus-paid-male", retrievedAt: new Date().toISOString(), payload: { activity_group: "Employment and Related Activities", gender: "Male", participation_pct: 57.3, avg_minutes_per_day: 459, hours_per_day: 7.6 } },
      { id: "tus-4", datasetId: "ds-tus", source: "NSO MoSPI", sourceUrl: "https://mospi.gov.in/time-use-survey", externalId: "tus-paid-female", retrievedAt: new Date().toISOString(), payload: { activity_group: "Employment and Related Activities", gender: "Female", participation_pct: 18.4, avg_minutes_per_day: 317, hours_per_day: 5.3 } },
    ],
  },

  // 15. Economic Census
  {
    dataset: {
      id: "ds-ec",
      name: "7th All India Economic Census",
      source: "Data Informatics & Innovation Division (DIID)",
      sourceUrl: "https://mospi.gov.in/economic-census",
      category: "Economy",
      description: "Complete enumeration of all entrepreneurial units in the country (both organized and unorganized) involved in economic activities other than crop production.",
      frequency: "Census (7th Round)",
      referencePeriod: "2019-2022 Enumeration",
      lastUpdated: new Date().toISOString(),
      recordCount: 15,
      accessType: "authenticated API",
      theme: "EC",
      externalId: "ec",
    },
    sampleRecords: [
      { id: "ec-1", datasetId: "ds-ec", source: "DIID MoSPI", sourceUrl: "https://mospi.gov.in/economic-census", externalId: "ec-all-india", retrievedAt: new Date().toISOString(), payload: { region: "All India Total", establishments_crore: 6.84, total_workers_crore: 14.82, rural_share_pct: 58.2, urban_share_pct: 41.8, women_owned_pct: 19.4 } },
      { id: "ec-2", datasetId: "ds-ec", source: "DIID MoSPI", sourceUrl: "https://mospi.gov.in/economic-census", externalId: "ec-up", retrievedAt: new Date().toISOString(), payload: { region: "Uttar Pradesh", establishments_crore: 0.94, total_workers_crore: 1.82, rural_share_pct: 66.4, urban_share_pct: 33.6, women_owned_pct: 16.2 } },
      { id: "ec-3", datasetId: "ds-ec", source: "DIID MoSPI", sourceUrl: "https://mospi.gov.in/economic-census", externalId: "ec-mh", retrievedAt: new Date().toISOString(), payload: { region: "Maharashtra", establishments_crore: 0.72, total_workers_crore: 1.94, rural_share_pct: 48.0, urban_share_pct: 52.0, women_owned_pct: 21.0 } },
      { id: "ec-4", datasetId: "ds-ec", source: "DIID MoSPI", sourceUrl: "https://mospi.gov.in/economic-census", externalId: "ec-tn", retrievedAt: new Date().toISOString(), payload: { region: "Tamil Nadu", establishments_crore: 0.65, total_workers_crore: 1.48, rural_share_pct: 44.5, urban_share_pct: 55.5, women_owned_pct: 24.8 } },
    ],
  },

  // 16. NSS 78th Round
  {
    dataset: {
      id: "ds-nss78",
      name: "NSS 78th Round: Multiple Indicator Survey",
      source: "National Sample Survey Office (NSSO)",
      sourceUrl: "https://mospi.gov.in/nss78",
      category: "Amenities",
      description: "Nationwide comprehensive survey assessing housing conditions, drinking water access, sanitation facilities, digital connectivity, and internal migration in India.",
      frequency: "Round-wise Series",
      referencePeriod: "2020-2021",
      lastUpdated: new Date().toISOString(),
      recordCount: 14,
      accessType: "authenticated API",
      theme: "NSS78",
      externalId: "nss78",
    },
    sampleRecords: [
      { id: "nss78-1", datasetId: "ds-nss78", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/nss78", externalId: "nss78-water", retrievedAt: new Date().toISOString(), payload: { indicator: "Households with Improved Drinking Water Source (%)", sector: "All India", total_pct: 95.7, rural_pct: 95.1, urban_pct: 97.2, target_sdg: 100.0 } },
      { id: "nss78-2", datasetId: "ds-nss78", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/nss78", externalId: "nss78-sanit", retrievedAt: new Date().toISOString(), payload: { indicator: "Households with Exclusive Latrine Facility (%)", sector: "All India", total_pct: 78.7, rural_pct: 73.9, urban_pct: 91.2, target_sdg: 100.0 } },
      { id: "nss78-3", datasetId: "ds-nss78", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/nss78", externalId: "nss78-fuel", retrievedAt: new Date().toISOString(), payload: { indicator: "Households using Clean Cooking Fuel (LPG/PNG) (%)", sector: "All India", total_pct: 69.8, rural_pct: 58.1, urban_pct: 92.0, target_sdg: 100.0 } },
      { id: "nss78-4", datasetId: "ds-nss78", source: "NSSO MoSPI", sourceUrl: "https://mospi.gov.in/nss78", externalId: "nss78-mobile", retrievedAt: new Date().toISOString(), payload: { indicator: "Persons (15-29 yrs) able to use Internet (%)", sector: "All India", total_pct: 72.9, rural_pct: 67.2, urban_pct: 85.5, target_sdg: 100.0 } },
    ],
  },
];
