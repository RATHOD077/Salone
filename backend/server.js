import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or current working directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import cors from 'cors';
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dns from 'node:dns';
import fs from 'node:fs/promises';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'feedback.json');

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
let mongoClientPromise;
let isMongoHealthy = false;

function configureMongoDns() {
  const servers = (process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    try {
      dns.setServers(servers);
      console.log(`[mongodb] Using DNS servers: ${servers.join(', ')}`);
    } catch (err) {
      console.warn('[mongodb] Could not set DNS servers:', err.message);
    }
  }
}

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '50kb' }));

// ─── Local JSON Fallback Storage ─────────────────────────────────────────────
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, '[]', 'utf8');
    }
  } catch (err) {
    console.error('[local-storage] Error ensuring data directory:', err.message);
  }
}

async function getLocalFeedback() {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[local-storage] Error reading data file:', err.message);
    return [];
  }
}

async function saveLocalFeedback(list) {
  await ensureDataFile();
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('[local-storage] Error writing data file:', err.message);
  }
}

// ─── MongoDB Connection ───────────────────────────────────────────────────────
function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!mongoClientPromise) {
    mongoClientPromise = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }).connect();
  }

  return mongoClientPromise;
}

async function checkMongoConnection() {
  try {
    const client = await getMongoClient();
    await client.db(process.env.MONGODB_DB || 'salon').command({ ping: 1 });
    isMongoHealthy = true;
    console.log(
      `[mongodb] Connected successfully to database "${process.env.MONGODB_DB || 'salon'}".`,
    );
  } catch (error) {
    mongoClientPromise = undefined;
    isMongoHealthy = false;
    console.warn(`[mongodb] MongoDB initial ping warning: ${error.message}. Local storage ready.`);
  }
}

async function getFeedbackCollection() {
  const client = await getMongoClient();
  const database = client.db(process.env.MONGODB_DB || 'salon');
  return database.collection('private_feedback');
}

// ─── Unified Data Layer ───────────────────────────────────────────────────────
async function insertFeedbackItem(item) {
  try {
    const coll = await getFeedbackCollection();
    const result = await coll.insertOne(item);
    isMongoHealthy = true;
    // Also mirror to local fallback for safety
    const local = await getLocalFeedback();
    local.unshift({ ...item, _id: result.insertedId.toString() });
    await saveLocalFeedback(local.slice(0, 500));
    return result.insertedId.toString();
  } catch (error) {
    isMongoHealthy = false;
    console.warn('[storage] MongoDB write unavailable. Saving to local storage.');
    const local = await getLocalFeedback();
    const fallbackId = 'loc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const itemWithId = { ...item, _id: fallbackId };
    local.unshift(itemWithId);
    await saveLocalFeedback(local);
    return fallbackId;
  }
}

async function fetchFeedbackItems() {
  try {
    const coll = await getFeedbackCollection();
    const items = await coll.find({}).sort({ createdAt: -1 }).limit(300).toArray();
    isMongoHealthy = true;
    return items.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      status: doc.status || 'new',
    }));
  } catch (error) {
    isMongoHealthy = false;
    console.warn('[storage] MongoDB read unavailable. Reading from local storage.');
    const local = await getLocalFeedback();
    return local.map((doc) => ({
      ...doc,
      status: doc.status || 'new',
    }));
  }
}

async function updateFeedbackStatus(id, newStatus, notes = '') {
  let updatedInMongo = false;
  try {
    const coll = await getFeedbackCollection();
    let query = { _id: id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }
    const updateDoc = {
      $set: {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
    };
    if (notes) updateDoc.$set.notes = notes;
    await coll.updateOne(query, updateDoc);
    updatedInMongo = true;
  } catch (err) {
    // Mongo write skipped
  }

  // Always update local storage
  const local = await getLocalFeedback();
  const index = local.findIndex((item) => String(item._id) === String(id));
  if (index !== -1) {
    local[index].status = newStatus;
    local[index].updatedAt = new Date().toISOString();
    if (notes) local[index].notes = notes;
    await saveLocalFeedback(local);
    return true;
  }
  return updatedInMongo;
}

async function deleteFeedbackItem(id) {
  try {
    const coll = await getFeedbackCollection();
    let query = { _id: id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }
    await coll.deleteOne(query);
  } catch {
    // Mongo delete skipped
  }

  const local = await getLocalFeedback();
  const filtered = local.filter((item) => String(item._id) !== String(id));
  await saveLocalFeedback(filtered);
  return true;
}

// ─── Authentication Helper ────────────────────────────────────────────────────
function isAdmin(request) {
  const configuredEmail = (process.env.ADMIN_EMAIL || 'haircraftsaloon1@gmail.com').trim().toLowerCase();
  const configuredPassword = (process.env.ADMIN_PASSWORD || 'admin@123').trim();

  // Support direct headers
  const headerEmail = request.get('x-admin-email')?.trim().toLowerCase();
  const headerPassword = request.get('x-admin-password')?.trim();

  if (headerEmail && headerPassword) {
    return headerEmail === configuredEmail && headerPassword === configuredPassword;
  }

  // Support bearer / base64 auth token
  const authHeader = request.get('authorization') || request.get('x-admin-token');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [email, password] = decoded.split(':');
      return email?.trim().toLowerCase() === configuredEmail && password?.trim() === configuredPassword;
    } catch {
      return false;
    }
  }

  return false;
}

function validateFeedback(body) {
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  if (!comment) return null;

  const rawRating = Number(body.rating);
  const rating = Number.isInteger(rawRating) && rawRating >= 1 && rawRating <= 5 ? rawRating : 1;

  return {
    rating,
    name: typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 80) : 'Anonymous',
    phone: typeof body.phone === 'string' ? body.phone.trim().slice(0, 20) : '',
    comment: comment.slice(0, 500),
    status: 'new', // 'new' | 'contacted' | 'resolved'
    createdAt: new Date().toISOString(),
  };
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    mongoConnected: isMongoHealthy,
    storage: isMongoHealthy ? 'mongodb' : 'local-json',
    timestamp: new Date().toISOString(),
  });
});

// Admin Login
app.post('/api/admin/login', (request, response) => {
  const { email, password } = request.body || {};
  const configuredEmail = (process.env.ADMIN_EMAIL || 'haircraftsaloon1@gmail.com').trim().toLowerCase();
  const configuredPassword = (process.env.ADMIN_PASSWORD || 'admin@123').trim();

  if (
    email &&
    email.trim().toLowerCase() === configuredEmail &&
    password &&
    password.trim() === configuredPassword
  ) {
    const token = Buffer.from(`${configuredEmail}:${configuredPassword}`).toString('base64');
    return response.json({
      success: true,
      email: configuredEmail,
      token,
      mongoConnected: isMongoHealthy,
    });
  }

  return response.status(401).json({ error: 'Invalid admin email or password.' });
});

// Admin Stats
app.get('/api/admin/stats', async (request, response) => {
  if (!isAdmin(request)) {
    return response.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const items = await fetchFeedbackItems();
    const total = items.length;
    const newCount = items.filter((i) => !i.status || i.status === 'new').length;
    const contacted = items.filter((i) => i.status === 'contacted').length;
    const resolved = items.filter((i) => i.status === 'resolved').length;

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    items.forEach((item) => {
      const r = item.rating || 1;
      ratingBreakdown[r] = (ratingBreakdown[r] || 0) + 1;
      ratingSum += r;
    });

    const averageRating = total > 0 ? (ratingSum / total).toFixed(1) : '5.0';

    return response.json({
      total,
      new: newCount,
      contacted,
      resolved,
      averageRating,
      ratingBreakdown,
      storage: isMongoHealthy ? 'mongodb' : 'local-json',
    });
  } catch (error) {
    return response.status(500).json({ error: 'Unable to calculate statistics.' });
  }
});

// Customer submits private feedback
app.post('/api/feedback', async (request, response) => {
  const feedback = validateFeedback(request.body || {});
  if (!feedback) {
    return response.status(400).json({ error: 'A feedback message is required.' });
  }

  try {
    const id = await insertFeedbackItem(feedback);
    return response.status(201).json({ id, ok: true });
  } catch (error) {
    console.error('[feedback] Failed to store feedback:', error);
    return response.status(500).json({ error: 'Unable to store feedback right now.' });
  }
});

// Admin gets all feedback
app.get('/api/feedback', async (request, response) => {
  if (!isAdmin(request)) {
    return response.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const items = await fetchFeedbackItems();
    return response.json(items);
  } catch (error) {
    console.error('[feedback] Could not load private feedback:', error);
    return response.status(500).json({ error: 'Unable to load feedback right now.' });
  }
});

// Admin updates feedback status
app.patch('/api/feedback/:id', async (request, response) => {
  if (!isAdmin(request)) {
    return response.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = request.params;
  const { status, notes } = request.body || {};

  if (!['new', 'contacted', 'resolved'].includes(status)) {
    return response.status(400).json({ error: 'Status must be new, contacted, or resolved.' });
  }

  try {
    await updateFeedbackStatus(id, status, notes);
    return response.json({ success: true, id, status });
  } catch (error) {
    console.error('[feedback] Could not update feedback:', error);
    return response.status(500).json({ error: 'Could not update feedback.' });
  }
});

// Admin deletes a feedback item
app.delete('/api/feedback/:id', async (request, response) => {
  if (!isAdmin(request)) {
    return response.status(401).json({ error: 'Unauthorized.' });
  }

  const { id } = request.params;
  try {
    await deleteFeedbackItem(id);
    return response.json({ success: true, id });
  } catch (error) {
    console.error('[feedback] Could not delete feedback:', error);
    return response.status(500).json({ error: 'Could not delete feedback.' });
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