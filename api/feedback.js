import { getMongoClient } from './_mongodb.js';

function isAuthorized(request) {
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
  const suppliedToken = request.headers['x-admin-token'];
  return Boolean(configuredToken && suppliedToken && suppliedToken === configuredToken);
}

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json');
  return response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method === 'POST') {
    const { rating, name, phone, comment } = request.body || {};

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return sendJson(response, 400, { error: 'A feedback message is required.' });
    }

    try {
      const client = await getMongoClient();
      const database = client.db(process.env.MONGODB_DB || 'salon');
      const result = await database.collection('private_feedback').insertOne({
        rating: Number.isInteger(rating) ? rating : null,
        name: typeof name === 'string' ? name.trim().slice(0, 80) : 'Anonymous',
        phone: typeof phone === 'string' ? phone.trim().slice(0, 20) : '',
        comment: comment.trim().slice(0, 500),
        createdAt: new Date(),
      });

      return sendJson(response, 201, { id: result.insertedId.toString() });
    } catch (error) {
      console.error('[feedback] Could not store private feedback:', error);
      return sendJson(response, 500, { error: 'Unable to store feedback right now.' });
    }
  }

  if (request.method === 'GET') {
    if (!isAuthorized(request)) {
      return sendJson(response, 401, { error: 'Unauthorized.' });
    }

    try {
      const client = await getMongoClient();
      const database = client.db(process.env.MONGODB_DB || 'salon');
      const messages = await database
        .collection('private_feedback')
        .find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      return sendJson(response, 200, messages);
    } catch (error) {
      console.error('[feedback] Could not load private feedback:', error);
      return sendJson(response, 500, { error: 'Unable to load feedback right now.' });
    }
  }

  response.setHeader('Allow', 'GET, POST');
  return sendJson(response, 405, { error: 'Method not allowed.' });
}
