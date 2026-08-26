import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const docRoutes = Router();

// Endpoint for OpenAPI Specification JSON
docRoutes.get('/openapi.json', (_req, res) => {
  const specPath = path.join(__dirname, '../docs/openapi.json');
  if (fs.existsSync(specPath)) {
    const raw = fs.readFileSync(specPath, 'utf8');
    return res.json(JSON.parse(raw));
  }
  return res.status(404).json({ message: 'OpenAPI specification not found.' });
});

// Interactive Swagger / Modern API Documentation UI
docRoutes.get('/', (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ABSCONS One API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: sans-serif; }
    .top-header { background: #1a3a5c; color: #ffffff; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .top-header h1 { font-size: 18px; margin: 0; font-weight: 700; }
    .top-header p { font-size: 12px; margin: 4px 0 0 0; color: #94a3b8; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div class="top-header">
    <div>
      <h1>Abia State College of Nursing Sciences — API Reference</h1>
      <p>Interactive OpenAPI 3.0 Documentation &amp; Endpoint Explorer</p>
    </div>
    <div>
      <a href="/api/docs/openapi.json" target="_blank" style="background:#16a34a;color:#fff;padding:8px 14px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:600">Download OpenAPI Spec</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});
