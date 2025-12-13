const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const analyzeFood = async (imageBase64) => {
    try {
        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/jpeg',
                                data: imageBase64,
                            },
                        },
                        {
                            type: 'text',
                            text: `Analiza esta imagen de comida y proporciona la siguiente información en formato JSON:
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
IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`,
                        },
                    ],
                },
            ],
        });

        const responseText = message.content[0].text;

        // Parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in response');
        }

        const result = JSON.parse(jsonMatch[0]);

        return {
            foods: result.foods || [],
            totalCarbohydrates: result.totalCarbohydrates || 0,
            confidence: result.confidence || 'bajo',
            rawResponse: responseText,
        };
    } catch (error) {
        console.error('Error analyzing food with Claude:', error);
        throw error;
    }
};

module.exports = { analyzeFood };
