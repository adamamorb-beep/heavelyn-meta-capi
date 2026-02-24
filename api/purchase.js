const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const order = req.body;
const ip = req.headers["x-forwarded-for"]?.split(",")[0];
const userAgent = req.headers["user-agent"];
  const PIXEL_ID = "593570292256281"; // your real pixel ID
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: order.order_status_url,
        user_data: {
  em: order.email
    ? crypto
        .createHash("sha256")
        .update(order.email.trim().toLowerCase())
        .digest("hex")
    : undefined,
  client_ip_address: ip,
  client_user_agent: userAgent
},
        custom_data: {
          currency: order.currency,
          value: parseFloat(order.total_price),
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    console.log("META RESPONSE:", result);

    return res.status(200).json(result);
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};
