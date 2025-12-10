const fs = require('fs');
const path = require('path');

function tryRequire(name) {
  try {
    return require(name);
  } catch (e) {
    return null;
  }
}

let pdfParseFn = null;
let mammoth = null;

const candidates = [
  'pdf-parse',
  'pdf-parse/lib/pdf-parse',
  'pdf-parse/dist/pdf-parse',
  'pdf-parse/dist/index.js'
];

for (const c of candidates) {
  const mod = tryRequire(c);
  if (mod) {
    if (typeof mod === 'function') {
      pdfParseFn = mod;
      break;
    }
    if (mod.default && typeof mod.default === 'function') {
      pdfParseFn = mod.default;
      break;
    }
    if (mod.parse && typeof mod.parse === 'function') {
      pdfParseFn = mod.parse;
      break;
    }
  }
}

let pdfjs = null;
if (!pdfParseFn) {
  pdfjs = tryRequire('pdfjs-dist/legacy/build/pdf.js') || tryRequire('pdfjs-dist');
  if (pdfjs) {
    pdfjs = pdfjs.default || pdfjs;
  }
}

// Optional DOCX extractor
try {
  mammoth = require('mammoth');
} catch (e) {
  mammoth = null;
}

async function extractTextFromFile(filePath, mime) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.txt' || ext === '.md') {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      throw new Error('Unable to read text file: ' + e.message);
    }
  }
  if (ext === '.pdf' || mime === 'application/pdf') {
    if (pdfParseFn) {
      try {
        const data = fs.readFileSync(filePath);
        const parsed = await pdfParseFn(data);
        return parsed && (parsed.text || '');
      } catch (e) {
        throw new Error('PDF extraction failed (pdf-parse): ' + e.message);
      }
    }

    // Fallback: pdfjs-dist extraction
    if (pdfjs) {
      try {
        const data = new Uint8Array(fs.readFileSync(filePath));
        const loadingTask = pdfjs.getDocument({ data });
        const doc = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(i => (i.str || '')).join(' ');
          fullText += strings + '\\n';
        }
        return fullText;
      } catch (e) {
        throw new Error('PDF extraction failed (pdfjs-dist): ' + e.message);
      }
    }

    throw new Error('No PDF parser available. Please install pdf-parse or pdfjs-dist.');
  }

  if (ext === '.docx' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    if (!mammoth) {
      throw new Error('DOCX extraction unavailable. Please install the "mammoth" package.');
    }
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return (result && result.value) || '';
    } catch (e) {
      throw new Error('DOCX extraction failed: ' + e.message);
    }
  }

  throw new Error('Unsupported file type for summarisation. Please upload a .txt, .pdf, or .docx file for AI summarisation.');
}

module.exports = { extractTextFromFile };
//git remote add origin https://github.com/fateh0007/ims-assignment.git