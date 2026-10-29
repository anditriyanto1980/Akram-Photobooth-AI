
const MODEL = "gemini-3.1-flash-image";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method tidak diizinkan. Gunakan POST."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY belum diatur di Vercel."
    });
  }

  try {
    const payload = req.body;

    if (!payload || !Array.isArray(payload.contents)) {
      return res.status(400).json({
        error: "Payload pembuatan gambar tidak valid."
      });
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Gemini image error:", data);
      return res.status(upstream.status).json({
        error:
          data?.error?.message ||
          `Gemini gagal membuat gambar (HTTP ${upstream.status}).`
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Generate endpoint error:", error);

    return res.status(500).json({
      error: "Terjadi kesalahan saat membuat gambar."
    });
  }
};
