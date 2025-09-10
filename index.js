import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client (service role key → safe on server, never in browser)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "SupportME API is running" });
});

// Example: Get tickets for a customer
app.get("/tickets/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("customer_id", customerId);

    if (error) throw error;

    res.json({ tickets: data });
  } catch (err) {
    console.error("Error fetching tickets:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Health check for Render
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});
// Get customer info (placeholder for number + plan badge)
app.get("/customer-info/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("customers")
    .select("customer_number, plan")
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Map plan → badge URL
  const badges = {
    starter: "https://your-wix-url/starter.svg",
    pro: "https://your-wix-url/pro.svg",
    premier: "https://your-wix-url/premier.svg",
    ultimate: "https://your-wix-url/ultimate.svg",
    developer: "https://your-wix-url/dev.svg"
  };

  res.json({
    customer_number: data.customer_number,
    plan: data.plan,
    badge_url: badges[data.plan] || null
  });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SupportME API running on port ${PORT}`);
});
