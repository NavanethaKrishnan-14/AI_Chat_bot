const WEBHOOK_URL = import.meta.env.VITE_CHAT_API_URL;

console.log("API URL:", WEBHOOK_URL);

/**
 * Sends a message to Activepieces/Gemini
 * @param {string} userMessage
 * @returns {Promise<{reply: string}>}
 */
export const sendChatMessage = async (userMessage) => {
  if (!WEBHOOK_URL?.trim()) {
    throw new Error(
      "API URL is not set. Add VITE_CHAT_API_URL to your .env file and restart the dev server."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SERVER ERROR:", errorText);
      throw new Error(`Server error (${response.status})`);
    }

    const responseText = await response.text();

    console.log("RAW RESPONSE:", responseText);

    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error("JSON Parse Error:", error);
      throw new Error("Server returned invalid JSON");
    }

    console.log("PARSED RESPONSE:", data);

    const reply =
      data.reply ||
      data.text ||
      data.message ||
      data.response ||
      data.content ||
      data.body?.reply ||
      data.body?.text ||
      "";

    if (!reply) {
      console.error("No reply found in:", data);
      throw new Error(
        `No chatbot response found. Response was: ${JSON.stringify(data)}`
      );
    }

    return {
      reply,
    };
  } catch (err) {
    clearTimeout(timeout);

    console.error("[ChatAPI] Failure reason:", err);

    if (!navigator.onLine) {
      throw new Error(
        "You are offline. Check your internet connection."
      );
    }

    if (err.name === "AbortError") {
      throw new Error(
        "Gemini took too long to respond. Please try again."
      );
    }

    if (err.message?.includes("Failed to fetch")) {
      throw new Error(
        "Cannot reach the server. Possible causes:\n1. Backend is not running\n2. CORS is blocked\n3. Wrong API URL"
      );
    }

    throw err;
  }
};