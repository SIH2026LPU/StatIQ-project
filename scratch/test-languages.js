async function testAllLanguages() {
  const inferenceKey = process.env.BHASHINI_INFERENCE_KEY || "qEA_0ELvz9HxptiyewSPo6AiMjsmfMKEozyZOXamjB24RwEsxaxAtLpuTIwm3P-R";
  const serviceId = "ai4bharat/indictrans-v2-all-gpu--t4";
  const computeUrl = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

  const languages = [
    { code: "hi", name: "Hindi" },
    { code: "pa", name: "Punjabi" },
    { code: "bn", name: "Bengali" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
    { code: "ur", name: "Urdu" },
  ];

  const testText = "Competency Assessment and Skill Gap Analysis for Official Statistics";

  console.log("Testing text:", testText);
  console.log("------------------------------------------------------------------");

  for (const lang of languages) {
    try {
      const payload = {
        pipelineTasks: [
          {
            taskType: "translation",
            config: {
              language: {
                sourceLanguage: "en",
                targetLanguage: lang.code
              },
              serviceId: serviceId
            }
          }
        ],
        inputData: {
          input: [{ source: testText }]
        }
      };

      const res = await fetch(computeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": inferenceKey
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const target = data.pipelineResponse?.[0]?.output?.[0]?.target;
        console.log(`[SUCCESS] ${lang.name} (${lang.code}): ${target}`);
      } else {
        console.log(`[FAILED] ${lang.name} (${lang.code}): HTTP ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.log(`[ERROR] ${lang.name} (${lang.code}):`, e.message);
    }
  }
}

testAllLanguages();
