import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  const { data, error } = await supabase
    .from("files")
    .select("url")
    .eq("code", code)
    .single();

  if (error || !data) {
    return res.status(404).send("File not found");
  }

  return res.redirect(302, data.url);
}
