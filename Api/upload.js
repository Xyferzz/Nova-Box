import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {

  const apiKey = req.headers["x-api-key"];

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

  const form = formidable({
    multiples: false,
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal membaca file"
      });
    }

    const file = files.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Step 1 berhasil",
      file: {
        originalName: file.originalFilename,
        size: file.size,
        type: file.mimetype
      }
    });
  });
}
