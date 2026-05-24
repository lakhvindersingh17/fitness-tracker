import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: 'Analyze this food/drink image. Identify the main items and estimate the total calories, protein (g), carbs (g), and fat (g). If it includes a barcode, try to read the product nutritional info from it. Return ONLY valid JSON.',
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the recognized food or meal.' },
            calories: { type: Type.NUMBER, description: 'Estimated total calories.' },
            protein: { type: Type.NUMBER, description: 'Estimated protein in grams.' },
            carbs: { type: Type.NUMBER, description: 'Estimated carbohydrates in grams.' },
            fat: { type: Type.NUMBER, description: 'Estimated fat in grams.' },
          },
          required: ['name', 'calories', 'protein', 'carbs', 'fat'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
