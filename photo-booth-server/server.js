const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000; // Bisa diganti sesuai kebutuhan

app.use(cors());
app.use(express.static("uploads"));

// Setup penyimpanan file dengan Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file dengan timestamp
  }
});

const upload = multer({ storage });

// Endpoint untuk upload gambar
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const imageUrl = `http://localhost:${PORT}/` + req.file.filename;
  res.json({ imageUrl });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
