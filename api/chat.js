export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Use POST');

  // We added 'messages' here to catch the chat history from the frontend
  const { action, message, messages, imageUrl } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  try {
    let payload = {
      model: "llama-3.3-70b-versatile",
      // If the frontend sends chat history (messages), use it! 
      // Otherwise, fallback to the single message (for quizzes)
      messages: messages || [{ role: "user", content: message }]
    };

    if (action === 'vision') {
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
