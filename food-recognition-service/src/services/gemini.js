const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const analyzeFood = async (imageBase64) => {
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analiza esta imagen de comida y proporciona la siguiente información en formato JSON:
{
  "foods": [
    {
      "name": "nombre del alimento",
      "quantity": "cantidad estimada (ej: 1 taza, 100g, 1 unidad)",
      "carbohydrates": número de gramos de carbohidratos
    }
  ],
  "totalCarbohydrates": suma total de carbohidratos en gramos,
  "confidence": nivel de confianza del análisis (bajo, medio, alto)
}

Si no puedes identificar la comida con certeza, indica un nivel de confianza bajo.
Sé preciso con las cantidades de carbohidratos. Si no estás seguro, es mejor subestimar que sobreestimar.
IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`;

        // Generate content with the image
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg',
                },
            },
        ]);

        const response = await result.response;
        const responseText = response.text();

        // Parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in response');
        }

        const parsedResult = JSON.parse(jsonMatch[0]);

        return {
            foods: parsedResult.foods || [],
            totalCarbohydrates: parsedResult.totalCarbohydrates || 0,
            confidence: parsedResult.confidence || 'bajo',
            rawResponse: responseText,
        };
    } catch (error) {
        console.error('Error analyzing food with Gemini:', error);
        throw error;
    }
};

module.exports = { analyzeFood };
