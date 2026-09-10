export function mospiToken() {
  return process.env.MOSPI_API_TOKEN?.trim() || undefined;
}

export function mospiBaseUrl() {
  return process.env.MOSPI_API_BASE_URL?.trim() || "https://api.mospi.gov.in";
}

export function mospiAuthHeaders(): Record<string, string> {
  const token = mospiToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
