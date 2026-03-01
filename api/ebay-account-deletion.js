import crypto from "crypto";

// MUST match what you typed into eBay (32–80 chars; letters/numbers/_/-)
const VERIFICATION_TOKEN = "firecityuk-verification-token-2026-secure-key";

// MUST exactly match the endpoint URL you saved in eBay (no extra slash)
const ENDPOINT_URL = "https://firecity-ebay-webhook.vercel.app/api/ebay-account-deletion";

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export default async function handler(req, res) {
  try {
    // eBay validation: GET <endpoint>?challenge_code=...
    if (req.method === "GET") {
      const challengeCode = req.query?.challenge_code;

      if (!challengeCode || typeof challengeCode !== "string") {
        return res
          .status(200)
          .send("OK - endpoint is live (no challenge_code)");
      }

      // IMPORTANT: eBay requires hashing in this exact order:
      // challengeCode + verificationToken + endpointURL
      const challengeResponse = sha256Hex(
        challengeCode + VERIFICATION_TOKEN + ENDPOINT_URL
      );

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ challengeResponse });
    }

    // Actual notifications arrive via POST
    if (req.method === "POST") {
      console.log("eBay deletion/closure notification:", JSON.stringify(req.body));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
