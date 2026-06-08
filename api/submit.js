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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, address, hobbies } = req.body ?? {};

  if (!name || !email || !phone || !address) {
    return res.status(400).json({ error: 'Name, email, phone, and address are required.' });
  }

  if (!Array.isArray(hobbies) || hobbies.length === 0) {
    return res.status(400).json({ error: 'At least one hobby is required.' });
  }

  if (hobbies.length > 5) {
    return res.status(400).json({ error: 'A maximum of 5 hobbies are allowed.' });
  }

  try {
    const database = await getDb();
    const collection = database.collection('submissions');

    await collection.insertOne({
      name,
      email,
      phone,
      address,
      hobbies,
      submittedAt: new Date(),
    });

    return res.status(201).json({ message: 'Submission saved successfully.' });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to save submission.' });
  }
};
