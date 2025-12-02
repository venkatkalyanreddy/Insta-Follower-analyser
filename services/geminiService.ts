import { GoogleGenAI } from "@google/genai";
import { AnalysisStats } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSocialInsights = async (stats: AnalysisStats): Promise<string> => {
  try {
    const ai = getClient();
    const model = "gemini-2.5-flash";

    const prompt = `
      You are a social media expert and witty data analyst. 
      Analyze the following Instagram account statistics and provide a 3-paragraph summary.
      
      The tone should be professional but slightly cheeky/witty if the stats are unusual.
      
      Stats:
      - Following: ${stats.followingCount} people
      - Followers: ${stats.followersCount} people
      - Not Following Back: ${stats.notFollowingBackCount} (People I follow, but they don't follow me)
      - Fans: ${stats.fansCount} (People who follow me, but I don't follow them)
      - Mutuals: ${stats.mutualCount}
      - Follow Ratio: ${stats.followRatio.toFixed(2)}

      1. First paragraph: Analyze the "Health" of this account based on the ratio and mutuals.
      2. Second paragraph: Comment on the "Not Following Back" count. Is it high? What does that imply? (e.g., chasing celebrities, bots, or just unrequited friendship).
      3. Third paragraph: Give one piece of actionable advice to improve their engagement or clean up their list.
      
      Format with markdown.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights. Please ensure your API key is valid.";
  }
};
