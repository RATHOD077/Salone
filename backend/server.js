import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { MongoClient } from 'mongodb';
import dns from 'node:dns';

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
let mongoClientPromise;

function configureMongoDns() {
  const servers = (process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
    console.log(`[mongodb] Using DNS servers: ${servers.join(', ')}`);
  }
}

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '10kb' }));

function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!mongoClientPromise) {
    mongoClientPromise = new MongoClient(process.env.MONGODB_URI).connect();
  }

  return mongoClientPromise;
}

async function checkMongoConnection() {
  try {
    const client = await getMongoClient();
    await client.db(process.env.MONGODB_DB || 'salon').command({ ping: 1 });
    console.log(
      `[mongodb] Connected successfully to database "${process.env.MONGODB_DB || 'salon'}".`,
    );
  } catch (error) {
    mongoClientPromise = undefined;
    console.error('[mongodb] Connection failed:', error.message);
  }
}

function isAdmin(request) {
  const configuredEmail = process.env.ADMIN_EMAIL || 'haircraftsaloon1@gmail.com';
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const email = request.get('x-admin-email')?.trim().toLowerCase();
  const password = request.get('x-admin-password');
  return Boolean(
    email &&
    email === configuredEmail.toLowerCase() &&
    configuredPassword &&
    password &&
    password === configuredPassword,
  );
}

function validateFeedback(body) {
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  if (!comment) return null;

  return {
    rating: Number.isInteger(body.rating) ? body.rating : null,
    name: typeof body.name === 'string' ? body.name.trim().slice(0, 80) : 'Anonymous',
    phone: typeof body.phone === 'string' ? body.phone.trim().slice(0, 20) : '',
    comment: comment.slice(0, 500),
    createdAt: new Date(),
  };
}

async function getFeedbackCollection() {
  const client = await getMongoClient();
  const database = client.db(process.env.MONGODB_DB || 'salon');
  return database.collection('private_feedback');
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/feedback', async (request, response) => {
  const feedback = validateFeedback(request.body || {});
  if (!feedback) {
    return response.status(400).json({ error: 'A feedback message is required.' });
  }

  try {
    const result = await (await getFeedbackCollection()).insertOne(feedback);
    return response.status(201).json({ id: result.insertedId.toString() });
  } catch (error) {
    console.error('[feedback] Could not store private feedback:', error);
    return response.status(500).json({ error: 'Unable to store feedback right now.' });
  }
});

app.get('/api/feedback', async (request, response) => {
  if (!isAdmin(request)) {
    return response.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const messages = await (await getFeedbackCollection())
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return response.json(messages);
  } catch (error) {
    console.error('[feedback] Could not load private feedback:', error);
    return response.status(500).json({ error: 'Unable to load feedback right now.' });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found.' });
});

app.listen(port, () => {
  configureMongoDns();
  console.log(`Salon backend listening on http://localhost:${port}`);
  void checkMongoConnection();
});
