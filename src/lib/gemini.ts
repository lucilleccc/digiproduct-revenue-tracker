import { GoogleGenAI } from "@google/genai";
import { RevenueEntry, IncomeSource, UserGoal } from "../types";
import { format } from "date-fns";

cconst ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function getCoachingInsight(
  entries: RevenueEntry[],
  sources: IncomeSource[],
  goals: UserGoal,
  todayTotal: number
) {
  const model = "gemini-3-flash-preview";
  
  const recentEntries = entries.slice(0, 30);
  const sourceMap = sources.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>);
  
  const historyStr = recentEntries.map(e => `${e.date}: $${e.amount} from ${sourceMap[e.sourceId] || 'Unknown'}`).join('\n');
  
  const prompt = `
    You are a high-end personal revenue coach for a digital entrepreneur. 
    Your tone is motivational, supportive, action-driven, and premium. Speak like a business partner, not an accountant.
    
    Current Stats:
    - Today's Revenue: $${todayTotal}
    - Daily Target: $${goals.dailyTarget}
    - Yesterday's Revenue: ${entries.length > 1 ? entries[1].amount : 0}
    - Monthly Target: $${goals.monthlyTarget}
    
    Recent Revenue History:
    ${historyStr}
    
    Income Sources:
    ${sources.map(s => s.name).join(', ')}
    
    Your goal is to be a high-stakes business partner. Analyze the data meticulously.
    1. Performance Check: Compare today vs yesterday and today vs last week. Is the momentum accelerating or stalling?
    2. Powerhouse ID: Which specific product is pulling the most weight right now? Refer to it by name.
    3. Action Plan: Tell them exactly what to do. "Traffic is converting best on X, double down there." or "Sales are flat on Y, check your funnel."
    4. Motivational Edge: Connect these numbers to their entrepreneurial freedom.
    
    Constraint: Keep it under 3 sentences. Be punchy. Use specific source names and dollar amounts.
    
    Examples:
    - "Clipartistry is your current MVP with $450 this week. Shift your focus to that Etsy shop today to maintain this breakout momentum."
    - "You're 15% ahead of yesterday's pace! ClipArtSpark BOT is carrying the load—launch an upsell to your existing buyers to hit your $10k monthly goal early."
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text?.trim() || "Stay focused on your goals. Every small win builds the momentum for greatness.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep pushing forward. Consistency is the secret sauce to digital success.";
  }
}
