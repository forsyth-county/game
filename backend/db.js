const { MongoClient } = require('mongodb');

// Hard-coded MongoDB connection URL
const MONGODB_URI = 'mongodb+srv://blakeflyz1_db_user:REkE0JzAuMQUWZNU@cluster0.fh6dmbp.mongodb.net/superbowl2026?retryWrites=true&w=majority&appName=Cluster0';

let client;
let db;

async function connectDB() {
  try {
    if (db) {
      return db;
    }

    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    db = client.db('superbowl2026');
    
    console.log('✅ MongoDB connected successfully');
    
    // Create indexes for better performance
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Index for visitor stats
    await db.collection('visitors').createIndex({ date: 1 });
    await db.collection('visitors').createIndex({ visitorId: 1 });
    
    // Index for visits
    await db.collection('visits').createIndex({ timestamp: -1 });
    await db.collection('visits').createIndex({ date: 1 });
    
    // Index for player count
    await db.collection('playerCount').createIndex({ timestamp: -1 });
    await db.collection('playerCount').createIndex({ game: 1, timestamp: -1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('⚠️  Error creating indexes:', error);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
    db = null;
    client = null;
  }
}

module.exports = {
  connectDB,
  getDB,
  closeDB
};
