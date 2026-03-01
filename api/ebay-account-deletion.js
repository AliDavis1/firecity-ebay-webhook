import crypto from "crypto";

/**
 * eBay Marketplace Account Deletion/Closure Notifications
 * Endpoint validation uses:
 *  - verification token (32–80 chars) YOU choose and enter in eBay
 *  - challenge_code sent by eBay to your endpoint
 *
 * This handler supports:
 *  - GET validation: responds with challengeResponse
 *  - POST notifications: logs payload, returns 200 OK
 */

// ✅ Set this to EXACTLY what you enter in eBay (32–80 chars)
const VERIFICATION_TOKEN = "firecityuk-verification-token-2026-secure-key";

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export default async function handler(req, res) {
  try {
    // ---- GET: Endpoint validation challenge ----
    // eBay calls your endpoint with ?challenge_code=...
    if (req.method === "GET") {
      const challengeCode = req.query?.challenge_code;

      if (!challengeCode || typeof challengeCode !== "string") {
        // Helpful manual test in browser without a challenge_code
        return res.status(200).send("OK - endpoint is live (no challenge_code)");
      }

      // eBay expects SHA256(challenge_code + verification_token)
      const challengeResponse = sha256Hex(challengeCode + VERIFICATION_TOKEN);

      return res.status(200).json({ challengeResponse });
    }

    // ---- POST: Notifications ----
    if (req.method === "POST") {
      // You can store this in DB later if you want, but logging is enough for compliance.
      console.log(
        "eBay deletion/closure notification received:",
        JSON.stringify(req.body)
      );

      return res.status(200).json({ ok: true });
    }

    // ---- Any other method ----
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
