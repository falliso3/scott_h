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

  const { type = 'all', value = '' } = req.query;
  const database = await getDb();
  const col = database.collection('submissions');

  try {
    let result;

    if (type === 'all') {
      result = await col.find({}, { projection: { _id: 0 } }).sort({ submittedAt: -1 }).toArray();

    } else if (type === 'by-hobby') {
      if (!value) return res.status(400).json({ error: 'Provide a hobby to search.' });
      result = await col
        .find({ hobbies: { $regex: value, $options: 'i' } }, { projection: { _id: 0 } })
        .sort({ submittedAt: -1 })
        .toArray();

    } else if (type === 'by-name') {
      if (!value) return res.status(400).json({ error: 'Provide a name to search.' });
      result = await col
        .find({ name: { $regex: value, $options: 'i' } }, { projection: { _id: 0 } })
        .sort({ submittedAt: -1 })
        .toArray();

    } else if (type === 'by-phone') {
      if (!value) return res.status(400).json({ error: 'Provide a phone number to search.' });
      result = await col
        .find({ phone: { $regex: value, $options: 'i' } }, { projection: { _id: 0 } })
        .sort({ submittedAt: -1 })
        .toArray();

    } else if (type === 'popular-hobbies') {
      result = await col.aggregate([
        { $unwind: '$hobbies' },
        { $group: { _id: '$hobbies', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, hobby: '$_id', count: 1 } },
      ]).toArray();

    } else {
      return res.status(400).json({ error: 'Unknown query type.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to fetch records.' });
  }
};
