import { TranslationResponse } from "./types";

const ULCA_CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";

interface BhashiniConfig {
  userID: string;
  ulcaApiKey: string;
  pipelineId: string;
}

function getBhashiniConfig(): BhashiniConfig {
  const userID = process.env.BHASHINI_USER_ID;
  const ulcaApiKey = process.env.BHASHINI_ULCA_API_KEY;
  const pipelineId = process.env.BHASHINI_PIPELINE_ID;

  if (!userID || !ulcaApiKey || !pipelineId) {
    throw new Error("Missing BHASHINI environment variables");
  }

  return { userID, ulcaApiKey, pipelineId };
}

export async function translateViaBhashini(text: string, sourceLang: string, targetLang: string): Promise<TranslationResponse> {
  try {
    const config = getBhashiniConfig();

    // 1. Pipeline Config Call
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
        pipelineId: config.pipelineId,
      },
    };

    const configResponse = await fetch(ULCA_CONFIG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "userID": config.userID,
        "ulcaApiKey": config.ulcaApiKey,
      },
      body: JSON.stringify(configPayload),
    });

    if (!configResponse.ok) {
      throw new Error(`Bhashini Config Failed: ${configResponse.status} ${configResponse.statusText}`);
    }

    const configData = await configResponse.json();

    // Find the translation service ID
    const translationTask = configData.pipelineResponseConfig?.[0];
    if (!translationTask || translationTask.taskType !== "translation") {
      throw new Error("Bhashini returned invalid translation config");
    }

    const serviceId = translationTask.config?.[0]?.serviceId;
    if (!serviceId) {
      throw new Error(`Bhashini does not support ${sourceLang} to ${targetLang}`);
    }

    const inferenceApiKey = configData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value;
    const inferenceUrl = configData.pipelineInferenceAPIEndPoint?.callbackUrl;

    if (!inferenceApiKey || !inferenceUrl) {
      throw new Error("Missing Bhashini inference API details");
    }

    // 2. Pipeline Compute Call
    const computePayload = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang,
            },
            serviceId: serviceId,
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

    const computeResponse = await fetch(inferenceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": inferenceApiKey,
      },
      body: JSON.stringify(computePayload),
    });

    if (!computeResponse.ok) {
      throw new Error(`Bhashini Compute Failed: ${computeResponse.status} ${computeResponse.statusText}`);
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
      text: text, // Fallback to original text on error
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      cached: false,
      error: error.message,
    };
  }
}
