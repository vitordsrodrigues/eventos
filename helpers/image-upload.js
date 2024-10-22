const multer = require('multer');
const path = require('path');

// Configuração do multer para salvar as imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pasta de destino para as imagens
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo com timestamp
  }
});

const upload = multer({ storage: storage });

module.exports = upload;