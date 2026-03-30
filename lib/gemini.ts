

import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Geocodes an address using Gemini AI as a fallback when traditional services fail.
 * Returns [lat, lng] or null.
 */
export const geocodeWithGemini = async (address: string): Promise<[number, number] | null> => {
	if (!ai) return null;

	try {
		const response = await ai.models.generateContent({
			model: "gemini-3-flash-preview",
			contents: `Convert the following address into latitude and longitude coordinates. 
      Return ONLY a JSON object with "lat" and "lng" keys. No other text.
      Address: ${address}`,
			config: {
				responseMimeType: "application/json"
			}
		});

		const text = response.text;
		if (text) {
			const coords = JSON.parse(text);
			if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
				return [coords.lat, coords.lng];
			}
		}
	} catch (error) {
		console.error("Gemini geocoding error:", error);
	}
	return null;
};
