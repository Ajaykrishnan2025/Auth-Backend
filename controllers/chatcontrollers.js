import axios from "axios";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    // Example: connect to OpenAI or Gemini etc.
    const reply = `You said: "${message}". This is a sample AI response.`;

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error occurred" });
  }
};
