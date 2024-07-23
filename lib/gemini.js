export const fetchGeminiPrompt = async({ messageContents, apiKey, model = "gemini-1.5-pro" }) => {
	const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
		method: "POST",
		body: JSON.stringify({
			contents: messageContents
		}),
		headers: {
			"Content-Type": "application/json"
		}
	})

	if (!res.ok) {
		throw new Error(res.statusText || res.status)
	}

	const data = await res.json()
	const aiResponse = data?.candidates[0]?.content?.parts[0]?.text;

	return aiResponse
}

export const fetchGeminiImagePrompt = async({ image, prompt, apiKey, model = "gemini-1.5-pro" }) => {
	const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
		method: "POST",
		body: JSON.stringify({
			contents: [{
				role: "user",
				parts: [
					{
						text: prompt
					},
					{
						inline_data: {
							data: image,
							mime_type: "image/jpeg"
						}
					}
				]
			}]
		}),
		headers: {
			"Content-Type": "application/json"
		}
	})

	if (!res.ok) {
		throw new Error(res.statusText || res.status)
	}

	const data = await res.json()
	const aiResponse = data?.candidates[0]?.content?.parts[0]?.text;

	return aiResponse
}
