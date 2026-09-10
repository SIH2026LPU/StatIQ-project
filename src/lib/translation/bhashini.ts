import { TranslationResponse } from "./types";

const ULCA_CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";
const DEFAULT_INFERENCE_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";
const DEFAULT_PIPELINE_ID = "64392f96daac500b55c543cd";

interface BhashiniCredentials {
  udyatKey: string;
  inferenceKey: string;
  userId?: string;
  pipelineId: string;
}

interface CachedPipelineConfig {
  serviceIdMap: Record<string, string>; // e.g. "en-hi": "ai4bharat/indictrans-v2-all-gpu--t4"
  callbackUrl: string;
  inferenceApiKeyName: string;
  inferenceApiKeyValue: string;
  expiresAt: number;
}

let cachedConfig: CachedPipelineConfig | null = null;
const CONFIG_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

function getCredentials(): BhashiniCredentials {
  const udyatKey = process.env.BHASHINI_UDYAT_KEY || process.env.BHASHINI_ULCA_API_KEY || "";
  const inferenceKey = process.env.BHASHINI_INFERENCE_KEY || "";
  const userId = process.env.BHASHINI_USER_ID || "";
  const pipelineId = process.env.BHASHINI_PIPELINE_ID || DEFAULT_PIPELINE_ID;

  return { udyatKey, inferenceKey, userId, pipelineId };
}

/**
 * Resolves the Bhashini translation pipeline config and dynamic service ID.
 */
export async function getPipelineConfig(sourceLang = "en", targetLang = "hi"): Promise<{
  serviceId: string;
  callbackUrl: string;
  inferenceApiKeyName: string;
  inferenceApiKeyValue: string;
}> {
  const creds = getCredentials();
  const pairKey = `${sourceLang}-${targetLang}`;

  // Return cached config if still valid
  if (cachedConfig && Date.now() < cachedConfig.expiresAt) {
    const serviceId = cachedConfig.serviceIdMap[pairKey] || cachedConfig.serviceIdMap["default"] || "ai4bharat/indictrans-v2-all-gpu--t4";
    return {
      serviceId,
      callbackUrl: cachedConfig.callbackUrl || DEFAULT_INFERENCE_URL,
      inferenceApiKeyName: cachedConfig.inferenceApiKeyName || "Authorization",
      inferenceApiKeyValue: cachedConfig.inferenceApiKeyValue || creds.inferenceKey,
    };
  }

  // Attempt real Pipeline Config Call
  let serviceId = "ai4bharat/indictrans-v2-all-gpu--t4";
  let callbackUrl = DEFAULT_INFERENCE_URL;
  let inferenceApiKeyName = "Authorization";
  let inferenceApiKeyValue = creds.inferenceKey;

  if (creds.udyatKey) {
    try {
      const configPayload = {
        pipelineTasks: [
          {
            taskType: "translation",
            config: {
              language: {
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
              },
            },
          },
        ],
        pipelineRequestConfig: {
          pipelineId: creds.pipelineId,
        },
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "ulcaApiKey": creds.udyatKey,
      };
      if (creds.userId) {
        headers["userID"] = creds.userId;
      }

      const configRes = await fetch(ULCA_CONFIG_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(configPayload),
      });

      if (configRes.ok) {
        const configData = await configRes.json();
        const translationTask = configData.pipelineResponseConfig?.find(
          (t: any) => t.taskType === "translation"
        ) || configData.pipelineResponseConfig?.[0];

        const resolvedServiceId = translationTask?.config?.[0]?.serviceId;
        if (resolvedServiceId) {
          serviceId = resolvedServiceId;
        }

        if (configData.pipelineInferenceAPIEndPoint?.callbackUrl) {
          callbackUrl = configData.pipelineInferenceAPIEndPoint.callbackUrl;
        }

        if (configData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.name) {
          inferenceApiKeyName = configData.pipelineInferenceAPIEndPoint.inferenceApiKey.name;
        }
        if (configData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value) {
          inferenceApiKeyValue = configData.pipelineInferenceAPIEndPoint.inferenceApiKey.value;
        }

        // Cache the successful pipeline configuration
        cachedConfig = {
          serviceIdMap: {
            [pairKey]: serviceId,
            default: serviceId,
          },
          callbackUrl,
          inferenceApiKeyName,
          inferenceApiKeyValue: inferenceApiKeyValue || creds.inferenceKey,
          expiresAt: Date.now() + CONFIG_CACHE_TTL_MS,
        };
      }
    } catch (err) {
      console.warn("Bhashini Pipeline Config call fallback:", err);
    }
  }

  return {
    serviceId,
    callbackUrl,
    inferenceApiKeyName,
    inferenceApiKeyValue: inferenceApiKeyValue || creds.inferenceKey,
  };
}

/**
 * Translates text using the official Bhashini Pipeline Compute Call.
 */
export async function translateViaBhashini(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResponse> {
  if (!text || text.trim() === "") {
    return {
      success: true,
      text: "",
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      cached: false,
    };
  }

  try {
    const creds = getCredentials();
    const config = await getPipelineConfig(sourceLang, targetLang);

    const computePayload = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang,
            },
            serviceId: config.serviceId,
          },
        },
      ],
      inputData: {
        input: [
          {
            source: text,
          },
        ],
      },
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    headers[config.inferenceApiKeyName] = config.inferenceApiKeyValue || creds.inferenceKey;

    const computeResponse = await fetch(config.callbackUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(computePayload),
    });

    if (!computeResponse.ok) {
      throw new Error(`Bhashini Compute Failed with status ${computeResponse.status} ${computeResponse.statusText}`);
    }

    const computeData = await computeResponse.json();
    const translatedText = computeData.pipelineResponse?.[0]?.output?.[0]?.target;

    if (!translatedText) {
      throw new Error("Bhashini compute response missing target text");
    }

    return {
      success: true,
      text: translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      cached: false,
    };
  } catch (error: any) {
    return {
      success: false,
      text: text, // Graceful fallback to original text
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      cached: false,
      error: error?.message || "Translation error",
    };
  }
}
