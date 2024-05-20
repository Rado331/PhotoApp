const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuration de Multer pour gérer les uploads d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route pour gérer les uploads d'images
app.post('/upload', upload.single('photo'), function (req, res, next) {
  const filePath = req.file.path;
  const outputFilePath = `processed/${req.file.filename}`;

  // Utilisation d'ImageMagick pour transformer l'image en peinture
  exec(`convert ${filePath} -paint 4 ${outputFilePath}`, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ imagePath: outputFilePath });
  });
});

// Route pour servir les images
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));

// Démarrage du serveur sur le port 3000
app.listen(3000, function () {
  console.log('Server started on port 3000');
});
