export default async function handler(req, res) {
  // eBay will typically POST notifications
  if (req.method === "GET") {
    // Helpful for quick testing in your browser
    return res.status(200).send("OK - endpoint is live");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vercel will parse JSON automatically when sent as application/json
  const payload = req.body;

  // Log it (viewable in Vercel project logs)
  console.log("eBay deletion/closure webhook received:", JSON.stringify(payload));

  // Always respond quickly with 200 OK
  return res.status(200).json({ ok: true });
}
