import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Parses raw multipart/form-data buffer into fields and file buffers
 */
function parseMultipartBuffer(buffer, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);
  const fields = {};
  let file = null;

  let start = 0;
  while (start < buffer.length) {
    const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;

    // Check if end boundary
    if (buffer.indexOf(endBoundaryBuffer, boundaryIndex) === boundaryIndex) {
      break;
    }

    const nextBoundaryIndex = buffer.indexOf(
      boundaryBuffer,
      boundaryIndex + boundaryBuffer.length,
    );
    if (nextBoundaryIndex === -1) break;

    // Part content between boundaries (excluding the \r\n before next boundary)
    const partBuffer = buffer.subarray(
      boundaryIndex + boundaryBuffer.length + 2, // skip boundary + \r\n
      nextBoundaryIndex - 2, // exclude trailing \r\n
    );

    // Split headers and body at \r\n\r\n
    const headerEndIndex = partBuffer.indexOf('\r\n\r\n');
    if (headerEndIndex !== -1) {
      const headerStr = partBuffer.subarray(0, headerEndIndex).toString('utf8');
      const bodyBuffer = partBuffer.subarray(headerEndIndex + 4);

      // Parse Content-Disposition
      const dispositionMatch = headerStr.match(/name="([^"]+)"/);
      const filenameMatch = headerStr.match(/filename="([^"]+)"/);
      const contentTypeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

      if (dispositionMatch) {
        const fieldName = dispositionMatch[1];
        if (filenameMatch) {
          const originalname = filenameMatch[1];
          const mimetype = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
          file = {
            fieldname: fieldName,
            originalname,
            mimetype,
            buffer: bodyBuffer,
            size: bodyBuffer.length,
          };
        } else {
          fields[fieldName] = bodyBuffer.toString('utf8');
        }
      }
    }

    start = nextBoundaryIndex;
  }

  return { fields, file };
}

/**
 * Middleware to handle file uploads
 */
export const uploadMiddleware = (options = {}) => {
  const maxSizeBytes = options.maxSizeBytes || MAX_FILE_SIZE;
  const allowedMimeTypes = options.allowedMimeTypes || ALLOWED_MIME_TYPES;

  return async (req, res, next) => {
    const contentType = req.headers['content-type'] || '';

    // If request is not multipart/form-data, pass through
    if (!contentType.includes('multipart/form-data')) {
      return next();
    }

    const boundaryMatch = contentType.match(/boundary=(?:["']([^"']+)["']|([^;]+))/i);
    if (!boundaryMatch) {
      return res.status(400).json({ message: 'Invalid multipart boundary in request.' });
    }

    const boundary = boundaryMatch[1] || boundaryMatch[2];

    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      if (totalSize > maxSizeBytes) {
        req.pause();
        return res.status(413).json({
          message: `File size exceeds the allowable limit of ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`,
        });
      }
      chunks.push(chunk);
    });

    req.on('end', async () => {
      try {
        const fullBuffer = Buffer.concat(chunks);
        const { fields, file } = parseMultipartBuffer(fullBuffer, boundary);

        req.body = { ...(req.body || {}), ...fields };

        if (file && file.size > 0) {
          if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
            // Also accept common extensions
            const ext = path.extname(file.originalname).toLowerCase();
            const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx'];
            if (!allowedExts.includes(ext)) {
              return res.status(400).json({
                message: `Disallowed file format. Allowed formats: PDF, PNG, JPG, WEBP, DOC, DOCX.`,
              });
            }
          }

          const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          const randomKey = crypto.randomBytes(6).toString('hex');
          const savedFileName = `${Date.now()}-${randomKey}-${sanitizedName}`;
          const savedFilePath = path.join(UPLOADS_DIR, savedFileName);

          await fs.promises.writeFile(savedFilePath, file.buffer);

          req.file = {
            filename: savedFileName,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: savedFilePath,
            url: `/uploads/${savedFileName}`,
          };
        }

        next();
      } catch (err) {
        return res.status(500).json({
          message: 'Failed to process file upload.',
          error: err.message,
        });
      }
    });

    req.on('error', (err) => {
      return res.status(500).json({
        message: 'Upload stream error.',
        error: err.message,
      });
    });
  };
};

export { UPLOADS_DIR };
