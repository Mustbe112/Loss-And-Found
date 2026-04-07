import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function matchItems(lostItem, foundItem) {
  const prompt = `
You are an AI assistant for a Lost and Found system. Compare these two items and determine if they could be the same item.

LOST ITEM:
- Name: ${lostItem.name}
- Description: ${lostItem.description || 'N/A'}
- Category: ${lostItem.category}
- Location: ${lostItem.location}
- Date Lost: ${lostItem.date_occurred}

FOUND ITEM:
- Name: ${foundItem.name}
- Description: ${foundItem.description || 'N/A'}
- Category: ${foundItem.category}
- Location: ${foundItem.location}
- Date Found: ${foundItem.date_occurred}

Respond ONLY with a valid JSON object, no markdown, no explanation outside the JSON:
{
  "score": <number 0-100>,
  "confidence": "<Low|Medium|High>",
  "explanation": "<2-3 sentences explaining why they match or not>",
  "recommendation": "<match|no_match>"
}

Scoring guide:
- 80-100: Very likely the same item
- 50-79: Possibly the same item
- 0-49: Unlikely the same item
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    // Fallback: basic rule-based matching if AI quota exceeded
    console.warn('Gemini quota exceeded, using fallback matcher:', err.message);
    return fallbackMatch(lostItem, foundItem);
  }
}

function fallbackMatch(lostItem, foundItem) {
  let score = 0;

  // Same category
  if (lostItem.category === foundItem.category) score += 40;

  // Similar name (check common words)
  const lostWords = lostItem.name.toLowerCase().split(' ');
  const foundWords = foundItem.name.toLowerCase().split(' ');
  const commonWords = lostWords.filter(w => foundWords.includes(w) && w.length > 2);
  score += Math.min(commonWords.length * 15, 30);

  // Similar location
  const lostLoc = lostItem.location.toLowerCase();
  const foundLoc = foundItem.location.toLowerCase();
  if (lostLoc === foundLoc) score += 20;
  else if (lostLoc.split(' ').some(w => foundLoc.includes(w) && w.length > 3)) score += 10;

  // Close dates (within 7 days)
  const lostDate = new Date(lostItem.date_occurred);
  const foundDate = new Date(foundItem.date_occurred);
  const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 1) score += 10;
  else if (daysDiff <= 7) score += 5;

  score = Math.min(score, 100);

  const confidence = score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low';

  return {
    score,
    confidence,
    explanation: `Rule-based match (AI quota exceeded). Category match: ${lostItem.category === foundItem.category}. Common name words: ${commonWords.join(', ') || 'none'}. Location similarity checked.`,
    recommendation: score >= 50 ? 'match' : 'no_match',
  };
}