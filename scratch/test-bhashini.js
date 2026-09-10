async function testBhashini() {
  const udyatKey = process.env.BHASHINI_UDYAT_KEY || "01b2dbfe5c-6e89-4ec8-8bee-3c80984a9617";
  const inferenceKey = process.env.BHASHINI_INFERENCE_KEY || "qEA_0ELvz9HxptiyewSPo6AiMjsmfMKEozyZOXamjB24RwEsxaxAtLpuTIwm3P-R";
  const userId = process.env.BHASHINI_USER_ID || "";

  console.log("Testing with pipelineId: 64392f96daac500b55c543cd");

  const url = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";
  
  const payload = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: "en",
            targetLanguage: "hi"
          }
        }
      }
    ],
    pipelineRequestConfig: {
      pipelineId: "64392f96daac500b55c543cd"
    }
  };

  const headers = {
    "Content-Type": "application/json",
    "ulcaApiKey": udyatKey
  };
  if (userId) {
    headers["userID"] = userId;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log("Config Response Status:", res.status, res.statusText);
    const text = await res.text();
    console.log("Config Response Body:", text);

    if (res.ok) {
      const configData = JSON.parse(text);
      const translationTask = configData.pipelineResponseConfig?.find(t => t.taskType === "translation") || configData.pipelineResponseConfig?.[0];
      const serviceId = translationTask?.config?.[0]?.serviceId;
      const inferenceApiKeyName = configData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.name || "Authorization";
      const inferenceApiKeyValue = configData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || inferenceKey;
      const inferenceUrl = configData.pipelineInferenceAPIEndPoint?.callbackUrl;

      console.log("\n--- PIPELINE CONFIG SUCCESS ---");
      console.log("Service ID:", serviceId);
      console.log("Inference URL:", inferenceUrl);
      console.log("Inference Header Name:", inferenceApiKeyName);
      console.log("Inference Header Value:", inferenceApiKeyValue ? "[EXISTS]" : "[MISSING]");

      // Now test Pipeline Compute Call
      const computePayload = {
        pipelineTasks: [
          {
            taskType: "translation",
            config: {
              language: {
                sourceLanguage: "en",
                targetLanguage: "hi"
              },
              serviceId: serviceId
            }
          }
        ],
        inputData: {
          input: [
            {
              source: "Welcome to StatIQ AI"
            }
          ]
        }
      };

      const computeHeaders = {
        "Content-Type": "application/json"
      };
      computeHeaders[inferenceApiKeyName] = inferenceApiKeyValue;

      console.log("\nCalling Pipeline Compute at:", inferenceUrl);
      const computeRes = await fetch(inferenceUrl, {
        method: "POST",
        headers: computeHeaders,
        body: JSON.stringify(computePayload)
      });

      console.log("Compute Response Status:", computeRes.status, computeRes.statusText);
      const computeText = await computeRes.text();
      console.log("Compute Response Body:", computeText);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testBhashini();
