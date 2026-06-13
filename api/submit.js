const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

let db;
async function getDb() {
  if(!db) {
    await client.connect();
    db = client.db('registrations');
  }
  return db;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if(req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if(req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, hobbies } = req.body ?? {};

  if(!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  if(!Array.isArray(hobbies) || hobbies.length < 5) {
    return res.status(400).json({ error: 'Not enough hobbies. You must add five' });
  }

  //Use a set here to ensure the array and set are the same size, ensuring no
  //duplicate entries
  if (new Set(hobbies).size !== hobbies.length) {
    return res.status(400).json({ error: 'No duplicate hobbies are allowed' });
  }

  if(hobbies.length > 5) {
    return res.status(400).json({ error: 'A maximum of 5 hobbies are allowed.' });
  }

  try {
    const database = await getDb();
    const collection = database.collection('submissions');

    const result = await collection.updateOne(
      { name, phone },
      {
        $set: { hobbies, updatedAt: new Date() },
        $setOnInsert: { submittedAt: new Date() },
      },
      { upsert: true }
    );

    const updated = result.matchedCount > 0;
    return res.status(200).json({
      message: updated ? 'Your preferences have been updated.' : 'Submission saved successfully.',
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to save submission.' });
  }
};
