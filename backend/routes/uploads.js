
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const fs = require('fs');

const uploadDir = path.join(__dirname,'../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null, uploadDir),
  filename: (req,file,cb)=> cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/document', upload.single('doc'), async (req,res)=>{
  const doc = new Document({
    originalName: req.file.originalname,
    path: req.file.path,
    mime: req.file.mimetype,
    uploadedAt: new Date()
  });
  await doc.save();
  res.json({ ok:true, doc });
});

// list docs
router.get('/', async (req,res)=>{
  const docs = await Document.find().sort({uploadedAt:-1}).limit(20);
  res.json(docs);
});

module.exports = router;
