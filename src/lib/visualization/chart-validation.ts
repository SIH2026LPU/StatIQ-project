import { ChartSpec, ChartSpecSchema } from "./chart-schema";
import { ChartRegistry } from "./chart-registry";

export class ChartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChartValidationError";
  }
}

export function validateChartSpec(spec: unknown): ChartSpec {
  // 1. Validate structure using Zod
  const parseResult = ChartSpecSchema.safeParse(spec);
  if (!parseResult.success) {
    // Log developer details in development
    console.error("CHART_SCHEMA_INVALID:", (parseResult.error as any).errors);
    
    // Throw user-friendly error message
    throw new ChartValidationError("Unable to render this visualization because the chart configuration is invalid.");
  }

  const validSpec = parseResult.data;

  // 2. Validate against Registry constraints
  const registryEntry = ChartRegistry[validSpec.type];
  if (!registryEntry) {
    // If it's a capability that exists in schema but not yet in registry
    return validSpec; 
  }

  const data = validSpec.data || [];
  
  // Check minimum data points
  if (data.length < registryEntry.minimumDataPoints) {
    throw new ChartValidationError(
      `Chart type '${validSpec.type}' requires at least ${registryEntry.minimumDataPoints} data points, but received ${data.length}.`
    );
  }

  // Check categories recommendation for Pie/Donut
  if (
    registryEntry.maximumRecommendedCategories && 
    data.length > registryEntry.maximumRecommendedCategories &&
    (validSpec.type === "pie" || validSpec.type === "donut")
  ) {
    // This is a soft validation, maybe we shouldn't throw, but the requirements 
    // strictly say "Do not use pie when there are dozens of categories."
    if (data.length > 15) {
      throw new ChartValidationError(
        `Chart type '${validSpec.type}' is not appropriate for ${data.length} categories. A bar chart is recommended.`
      );
    }
  }

  return validSpec;
}
