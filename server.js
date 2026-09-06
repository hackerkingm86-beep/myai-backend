
const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        ok: true,
        message: "My AI backend is running"
    });
});

app.post("/chat", async (req, res) => {
    try {
        const message = String(req.body.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-5.6-luna",
                    max_output_tokens: 800,
                    instructions: "Your name is Priya. You are Priya, the AI assistant. Never say your name is ChatGPT.",
                    tools: [
    { type: "web_search" }
],    
                    input: message
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.error?.message || "OpenAI API error"
            });
        }

        const outputText = (data.output || [])
    .flatMap(item => item.content || [])
    .filter(item => item.type === "output_text");

const reply = outputText
    .map(item => item.text)
    .join("");

const links = outputText
    .flatMap(item => item.annotations || [])
    .filter(item => item.type === "url_citation")
    .map(item => ({
        title: item.title || "Source",
        url: item.url
    }));

res.json({
    reply: reply || "No response received.",
    links: links
});

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
