export function getCourseThumbnail(title: string): string {
  const lowerTitle = title.toLowerCase();

  // Python / ETL / Code
  if (lowerTitle.includes("python") || lowerTitle.includes("etl") || lowerTitle.includes("programming")) {
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80";
  }
  
  // SQL / Data Engineering / Database
  if (lowerTitle.includes("sql") || lowerTitle.includes("database") || lowerTitle.includes("api") || lowerTitle.includes("cloud")) {
    return "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80";
  }

  // Visualization / Charts
  if (lowerTitle.includes("visual") || lowerTitle.includes("chart") || lowerTitle.includes("dashboard")) {
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80";
  }

  // AI / ML / Advanced Tech
  if (lowerTitle.includes("ai") || lowerTitle.includes("machine learning") || lowerTitle.includes("cyber")) {
    return "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80";
  }

  // Geography / GIS / Spatial
  if (lowerTitle.includes("gis") || lowerTitle.includes("spatial") || lowerTitle.includes("geography")) {
    return "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80";
  }

  // Sampling / Surveys / Social Statistics
  if (lowerTitle.includes("sampl") || lowerTitle.includes("survey") || lowerTitle.includes("population")) {
    return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80";
  }

  // General Statistics / National Accounts / Economics
  if (lowerTitle.includes("account") || lowerTitle.includes("economic") || lowerTitle.includes("stat")) {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80";
  }

  // Leadership / Management
  if (lowerTitle.includes("lead") || lowerTitle.includes("manag")) {
    return "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80";
  }

  // Fallback - Clean Tech/Data abstract
  return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";
}
