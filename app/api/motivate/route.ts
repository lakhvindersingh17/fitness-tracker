import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { 
      dayOfPlan,
      caloriesEaten, 
      calorieGoal,
      caloriesBurned,
      macros
    } = await req.json();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `I am on day ${dayOfPlan} of my 100-day diet plan. I have eaten ${caloriesEaten}/${calorieGoal} kcal and burned ${caloriesBurned} kcal today. Macros: ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat. Please give me a very short, punchy (1-2 sentences max) motivational message to keep me going or finish the day strong! Do not use any hashtags.`,
    });

    return NextResponse.json({ message: response.text });
  } catch (error) {
    console.error('Error generating motivation:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
