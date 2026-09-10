const fs = require('fs');
const path = require('path');

const inferenceKey = process.env.BHASHINI_INFERENCE_KEY || "qEA_0ELvz9HxptiyewSPo6AiMjsmfMKEozyZOXamjB24RwEsxaxAtLpuTIwm3P-R";
const serviceId = "ai4bharat/indictrans-v2-all-gpu--t4";
const computeUrl = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const enData = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

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

async function translateBatch(texts, targetLang) {
  const payload = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: "en",
            targetLanguage: targetLang,
          },
          serviceId: serviceId,
        },
      },
    ],
    inputData: {
      input: texts.map((t) => ({ source: t })),
    },
  };

  const res = await fetch(computeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": inferenceKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Bhashini translation failed for ${targetLang}: ${res.statusText}`);
  }

  const data = await res.json();
  const outputs = data.pipelineResponse?.[0]?.output || [];
  return outputs.map((o) => o.target);
}

// Recursively extract all string values and paths
function extractStrings(obj, prefix = '') {
  let entries = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      entries.push({ path: fullPath, text: value });
    } else if (typeof value === 'object' && value !== null) {
      entries = entries.concat(extractStrings(value, fullPath));
    }
  }
  return entries;
}

// Rebuild nested object from paths
function rebuildObject(pathsAndValues) {
  const result = {};
  for (const { path: p, text } of pathsAndValues) {
    const keys = p.split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = text;
  }
  return result;
}

async function run() {
  const stringEntries = extractStrings(enData);
  console.log(`Extracted ${stringEntries.length} strings from en.json.`);

  const batchSize = 25;

  for (const lang of languages) {
    console.log(`\nProcessing ${lang.name} (${lang.code})...`);
    const targetFile = path.join(localesDir, `${lang.code}.json`);
    let existingObj = {};
    if (fs.existsSync(targetFile)) {
      try {
        existingObj = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
      } catch (e) {
        existingObj = {};
      }
    }

    // Find keys that are missing in existingObj
    const existingEntries = extractStrings(existingObj);
    const existingMap = new Map(existingEntries.map((e) => [e.path, e.text]));

    const missingEntries = stringEntries.filter(
      (item) => !existingMap.has(item.path) || !existingMap.get(item.path)
    );

    console.log(`  Found ${missingEntries.length} missing/new strings out of ${stringEntries.length}.`);

    if (missingEntries.length > 0) {
      for (let i = 0; i < missingEntries.length; i += batchSize) {
        const chunk = missingEntries.slice(i, i + batchSize);
        const chunkTexts = chunk.map((item) => {
          if (item.text === "StatIQ AI") return "StatIQ AI";
          return item.text;
        });

        try {
          const translatedTexts = await translateBatch(chunkTexts, lang.code);
          chunk.forEach((item, idx) => {
            let text = translatedTexts[idx] || item.text;
            if (item.path === 'nav.brand') text = "StatIQ AI";
            existingMap.set(item.path, text);
          });
          console.log(`  Translated ${Math.min(i + batchSize, missingEntries.length)}/${missingEntries.length} missing strings for ${lang.code}`);
        } catch (err) {
          console.error(`  Error translating chunk for ${lang.code}:`, err.message);
          chunk.forEach((item) => {
            existingMap.set(item.path, item.text);
          });
        }
      }
    }

    // Reconstruct full list for all enData keys
    const finalEntries = stringEntries.map((item) => ({
      path: item.path,
      text: existingMap.get(item.path) || item.text,
    }));

    const localizedObj = rebuildObject(finalEntries);
    fs.writeFileSync(targetFile, JSON.stringify(localizedObj, null, 2), 'utf8');
    console.log(`  Saved -> ${targetFile}`);
  }

  console.log("\nAll Indic locales synced successfully!");
}

run();
