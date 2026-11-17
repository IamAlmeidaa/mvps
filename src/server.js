import express from 'express';
import { fileURLToPath } from 'node:url';
import { getDb } from './db/client.js';

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.static(fileURLToPath(new URL('../public/', import.meta.url))));

app.get('/api/health', async (_req, res) => {
  try {
    const sql = getDb();
    await sql`SELECT 1`;
    res.json({ status: 'ok', database: true });
  } catch (error) {
    console.error('Falha ao verificar conexão com banco:', error.message);
    res.status(503).json({ status: 'error', database: false });
  }
});

app.post('/api/leads', async (req, res) => {
  const { name, email, store, message } = req.body ?? {};
  if (![name, email, store].every((value) => typeof value === 'string' && value.trim())
    || name.trim().length > 120
    || email.trim().length > 254
    || store.trim().length > 180
    || (typeof message === 'string' && message.length > 2000)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Informe nome, e-mail e loja.' });
  }
  try {
    const sql = getDb();
    await sql`CREATE TABLE IF NOT EXISTS leads (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      store TEXT NOT NULL,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`INSERT INTO leads (name, email, store, message)
      VALUES (${name.trim()}, ${email.trim()}, ${store.trim()}, ${typeof message === 'string' ? message.trim() : ''})`;
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Falha ao salvar lead:', error.message);
    res.status(503).json({ error: 'Não foi possível enviar agora. Tente novamente mais tarde.' });
  }
});

app.use((error, _req, res, _next) => {
  console.error('Erro não tratado na API:', error.message);
  res.status(error.status === 413 ? 413 : 500).json({
    error: error.status === 413 ? 'A solicitação excede o tamanho permitido.' : 'Erro interno. Tente novamente mais tarde.',
  });
});

const port = Number(process.env.PORT) || 3000;
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Sync Market disponível em http://localhost:${port}`));
}

export default app;
