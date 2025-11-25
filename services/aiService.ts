import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generatePerformanceScript = async (prompt: string, language: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const systemPrompt = `
      You are an expert Performance Testing Engineer. 
      Generate a performance testing script in ${language} (e.g., using Locust for Python, k6 for JS) based on the user's request.
      Return ONLY the code block without markdown formatting (no \`\`\`).
      Include comments explaining the key parts of the load test.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      }
    });

    return response.text || "// Failed to generate script.";
  } catch (error) {
    console.error("Error generating script:", error);
    return `// Error generating script: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const analyzePerformanceResults = async (dataSummary: string): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following performance test summary and provide 3 bullet points of optimization recommendations: ${dataSummary}`
    });
    return response.text || "No analysis available.";
  } catch (error) {
    return "Analysis service unavailable.";
  }
};
