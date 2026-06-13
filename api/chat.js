export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Use POST');

  const { action, message, imageUrl } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  try {
    let payload = {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: message }]
    };

    // If it's a vision request, change the model and content structure
    if (action === 'vision') {
      // Allow the frontend to tell it whether to "Analyze" or "Make a Quiz"
      const promptText = message || "Explain what is in this image for my homework.";
      
      payload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }]
      };
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await groqRes.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
