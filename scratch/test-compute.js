async function testCompute() {
  const inferenceKey = process.env.BHASHINI_INFERENCE_KEY || "qEA_0ELvz9HxptiyewSPo6AiMjsmfMKEozyZOXamjB24RwEsxaxAtLpuTIwm3P-R";
  const serviceId = "ai4bharat/indictrans-v2-all-gpu--t4";
  const computeUrl = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

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
          source: "Welcome to StatIQ AI. Official statistical intelligence system."
        }
      ]
    }
  };

  const headers = {
    "Content-Type": "application/json",
    "Authorization": inferenceKey
  };

  console.log("Testing Compute Call to:", computeUrl);
  try {
    const res = await fetch(computeUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(computePayload)
    });

    console.log("Compute Status:", res.status, res.statusText);
    const body = await res.text();
    console.log("Compute Response Body:", body);
  } catch (err) {
    console.error("Compute Error:", err);
  }
}

testCompute();
