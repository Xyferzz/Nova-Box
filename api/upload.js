export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  const apiKey = req.headers["x-api-key"];

  if (!process.env.API_KEY) {
    console.error("Missing API_KEY env");
    return res.status(500).json({
      success: false,
      message: "Server misconfigured: API_KEY not set"
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid API Key"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
    });
  }

  // Dynamic import to handle ESM/CJS differences across environments
  let formidableModule;
  try {
    formidableModule = await import("formidable");
  } catch (err) {
    console.error("Failed to import formidable:", err);
    return res.status(500).json({
      success: false,
      message: "Server error: failed to load upload parser"
    });
  }

  // Create form instance with fallback for different exports
  let createForm;
  if (formidableModule.default && typeof formidableModule.default === "function") {
    createForm = formidableModule.default;
  } else if (formidableModule.IncomingForm) {
    createForm = (opts) => {
      return new formidableModule.IncomingForm(opts);
    };
  } else {
    console.error("Unsupported formidable module shape:", Object.keys(formidableModule));
    return res.status(500).json({
      success: false,
      message: "Server error: unsupported upload parser"
    });
  }

  const form = createForm({
    multiples: false,
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal membaca file"
      });
    }

    // files.file could be array or single object depending on parser shape
    const file = files?.file ?? files?.files;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan"
      });
    }

    // Normalize file object if it's an array
    const finalFile = Array.isArray(file) ? file[0] : file;

    return res.status(200).json({
      success: true,
      message: "Step 1 berhasil",
      file: {
        originalName: finalFile.originalFilename ?? finalFile.name ?? null,
        size: finalFile.size ?? null,
        type: finalFile.mimetype ?? finalFile.type ?? null
      }
    });
  });
}
