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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SupportME API running on port ${PORT}`);
});
