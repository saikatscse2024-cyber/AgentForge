import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const botService = {
  getGeminiResponse: async (prompt: string) => {
    if (!genAI) throw new Error("AI not initialized");

    const getBestModel = async () => {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        const flashModels = data.models.filter((m: any) =>
          m.name.includes('flash') && m.supportedGenerationMethods.includes('generateContent')
        );
        // Returns the latest available flash model string
        return flashModels.length > 0 ? flashModels[flashModels.length - 1].name.split('/').pop() : "gemini-1.5-flash";
      } catch {
        return "gemini-1.5-flash"; // Reliable fallback
      }
    };

    const modelName = await getBestModel();

    const attemptRequest = async (retries = 2): Promise<string> => {
      try {
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: "You are GuideBot for AgentForge. Keep help concise and friendly."
        });
        
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error: any) {
        // Handle Quota (429) specifically
        if (error.message.includes('429') && retries > 0) {
          const seconds = error.message.match(/retry in ([\d.]+)s/)?.[1] || 20;
          const waitMs = (parseFloat(seconds) + 2) * 1000;

          console.warn(`GuideBot Quota hit. Retrying in ${seconds}s...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          return attemptRequest(retries - 1);
        }
        throw error;
      }
    };

    return await attemptRequest();
  }
};