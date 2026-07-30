import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    return res.status(500).send("Server misconfigured: missing Supabase env vars");
  }

  if (!code) {
    return res.status(400).send("Missing code");
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    const { data, error } = await supabase
      .from("files")
      .select("url")
      .eq("code", code)
      .single();

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(404).send("File not found");
    }

    if (!data || !data.url) {
      return res.status(404).send("File not found");
    }

    return res.redirect(302, data.url);
  } catch (err) {
    console.error("Unexpected error in /api/short:", err);
    return res.status(500).send("Internal server error");
  }
}
