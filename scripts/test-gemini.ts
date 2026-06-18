import 'dotenv/config';
import { ai } from '../src/utils/gemini';

async function runTest() {
  const modelName = "gemini-3.5-flash";
  const start = Date.now();
  console.log(`Testing Gemini API with model: ${modelName}...`);
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Reply only with the word AESS_WORKING",
    });

    const end = Date.now();
    const duration = end - start;
    const responseText = response.text?.trim() || "";

    console.log(`Model: ${modelName}`);
    console.log(`Raw Response: "${responseText}"`);
    console.log(`Response Time: ${duration}ms`);

    if (responseText === "AESS_WORKING") {
      console.log("SUCCESS: Gemini API is connected and functional.");
      process.exit(0);
    } else {
      console.error(`FAILURE: Expected "AESS_WORKING", but got "${responseText}"`);
      process.exit(1);
    }
  } catch (error) {
    console.error("FAILURE: API call errored:", error);
    process.exit(1);
  }
}

runTest();
