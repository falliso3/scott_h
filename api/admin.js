const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

let db;
async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db('registrations');
  }
  return db;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const database = await getDb();
    const records = await database
      .collection('submissions')
      .find({}, { projection: { _id: 0 } })
      .sort({ submittedAt: -1 })
      .toArray();

    return res.status(200).json(records);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to fetch records.' });
  }
};
