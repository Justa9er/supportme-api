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

// Example: Get tickets for a tenant
app.get("/tickets/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const { data, error } = await supabase
      .from("tickets")
      .select("ticket_number, name, issue_category, priority, status, created_at, updated_at")
      .eq("tenant_id", tenantId);

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
// Get customer info (with Wix site ID + masked ID + badge URL)
app.get("/customer-info/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tenants")
    .select("customer_number, plan, wix_site_id")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Map plan → badge URL (Supabase storage)
  const badges = {
    starter: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/starter.png",
    pro: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/pro.png",
    premier: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/pre.png",
    ultimate: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/ult.png",
    developer: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/dev.png"
  };

  // Mask the last 12 characters of the Wix Site ID
  const maskedId = data.wix_site_id ? data.wix_site_id.slice(-12) : null;

  return res.json({
    customer_number: data.customer_number, // legacy slot
    wix_site_id: data.wix_site_id,
    masked_id: maskedId,
    plan: data.plan,
    badge_url: badges[data.plan] || null
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SupportME API running on port ${PORT}`);
});
