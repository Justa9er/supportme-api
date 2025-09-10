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

// Root health check
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

// Render health check
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Get tenant info (Wix site ID + masked ID + badge URL)
app.get("/tenant-info/:tenantId", async (req, res) => {
  const { tenantId } = req.params;

  const { data, error } = await supabase
    .from("tenants")
    .select("customer_number, plan, wix_site_id")
    .eq("id", tenantId)  // or .eq("wix_site_id", tenantId) if that's the real key
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const badges = {
    starter: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/starter.png",
    pro: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/pro.png",
    premier: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/pre.png",
    ultimate: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/ult.png",
    developer: "https://ucekalsakfxczmaxfpkq.supabase.co/storage/v1/object/public/badges/dev.png"
  };

  const maskedId = data.wix_site_id ? data.wix_site_id.slice(-12) : null;

  return res.json({
    tenant_number: data.customer_number, // legacy slot if needed
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
