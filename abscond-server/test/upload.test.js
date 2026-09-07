import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, UPLOADS_DIR, uploadMiddleware } from '../src/middleware/upload.js';

test('File Upload Middleware & Configuration', async (t) => {
  await t.test('uploads directory exists', () => {
    assert.ok(fs.existsSync(UPLOADS_DIR), 'Uploads directory should exist');
  });

  await t.test('allowed mime types include PDFs, images, and documents', () => {
    assert.ok(ALLOWED_MIME_TYPES.includes('application/pdf'));
    assert.ok(ALLOWED_MIME_TYPES.includes('image/png'));
    assert.ok(ALLOWED_MIME_TYPES.includes('image/jpeg'));
    assert.ok(ALLOWED_MIME_TYPES.includes('application/msword'));
  });

  await t.test('max file size is set to 10MB', () => {
    assert.equal(MAX_FILE_SIZE, 10 * 1024 * 1024);
  });

  await t.test('passes non-multipart requests through untouched', async () => {
    const middleware = uploadMiddleware();
    const req = {
      headers: { 'content-type': 'application/json' },
      body: { type: 'o-level-result' },
    };
    const res = {};
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.body.type, 'o-level-result');
  });
});
