import 'dotenv/config';
import app from './appBackend';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development (SPA support)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Fastify/Express compatibility wrapper if needed, 
    // but Fastify supports native middleware if wrapped correctly.
    // Given the complexity of Fastify-Vite integration,
    // let's stick to the backend-focused objective per Sprint 1, 
    // and just serve static if prod.
  }
  
  // Production: Serve dist
  const distPath = path.join(process.cwd(), 'dist');
  // For production, we can use fastify-static or similar.
  // For now, this is a clean backend foundation.

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running at http://0.0.0.0:${PORT}`);
}

startServer();
