import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from '../models/Song.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sonic-architect';
const CSV_PATH = path.join(process.cwd(), '../backend/songs.csv');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🍃 Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function clearExistingData() {
  try {
    const result = await Song.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} existing songs`);
  } catch (error) {
    console.error('❌ Error clearing existing data:', error.message);
    throw error;
  }
}

function parseCSVData(data) {
  return new Promise((resolve, reject) => {
    const songs = [];
    let rowCount = 0;

    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        try {
          rowCount++;
          
          // Transform CSV row to Song model format
          const song = {
            id: row.id || `song_${rowCount}`,
            name: row.name || row.track_name || 'Unknown Song',
            artist: row.artist || row.artists || 'Unknown Artist',
            album: row.album || row.album_name || '',
            year: row.year ? parseInt(row.year) : undefined,
            genre: row.genre ? [row.genre] : [],
            
            audioFeatures: {
              danceability: parseFloat(row.danceability) || 0,
              energy: parseFloat(row.energy) || 0,
              key: parseInt(row.key) || 0,
              loudness: parseFloat(row.loudness) || 0,
              mode: parseInt(row.mode) || 0,
              speechiness: parseFloat(row.speechiness) || 0,
              acousticness: parseFloat(row.acousticness) || 0,
              instrumentalness: parseFloat(row.instrumentalness) || 0,
              liveness: parseFloat(row.liveness) || 0,
              valence: parseFloat(row.valence) || 0,
              tempo: parseFloat(row.tempo) || 0
            },
            
            duration: row.duration_ms ? Math.round(parseInt(row.duration_ms) / 1000) : undefined,
            popularity: row.popularity ? parseInt(row.popularity) : 50,
            
            playCount: Math.floor(Math.random() * 1000), // Random play count for demo
            likeCount: Math.floor(Math.random() * 100),  // Random likes for demo
            
            // Add some demo external IDs
            spotifyId: row.spotify_id || undefined,
            youtubeId: row.youtube_id || undefined,
            
            tags: [],
            isActive: true
          };
          
          // Add some sample artwork URLs (placeholder)
          if (Math.random() > 0.7) {
            song.artwork = {
              small: `https://picsum.photos/64/64?random=${rowCount}`,
              medium: `https://picsum.photos/300/300?random=${rowCount}`,
              large: `https://picsum.photos/640/640?random=${rowCount}`
            };
          }
          
          songs.push(song);
          
        } catch (error) {
          console.warn(`⚠️ Error processing row ${rowCount}:`, error.message);
        }
      })
      .on('end', () => {
        console.log(`📊 Processed ${songs.length} songs from CSV`);
        resolve(songs);
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error.message);
        reject(error);
      });
  });
}

async function insertSongs(songs) {
  try {
    console.log('💾 Inserting songs into database...');
    
    // Insert in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < songs.length; i += batchSize) {
      const batch = songs.slice(i, i + batchSize);
      
      try {
        await Song.insertMany(batch, { 
          ordered: false, // Continue inserting even if some fail
          lean: true 
        });
        insertedCount += batch.length;
        console.log(`✅ Inserted batch ${Math.ceil((i + 1) / batchSize)} (${insertedCount}/${songs.length})`);
      } catch (error) {
        console.warn(`⚠️ Some songs in batch ${Math.ceil((i + 1) / batchSize)} failed to insert:`, error.message);
        // Count successful inserts even with some failures
        const successful = batch.length - (error.writeErrors?.length || 0);
        insertedCount += successful;
      }
    }
    
    console.log(`🎉 Successfully inserted ${insertedCount} songs`);
    return insertedCount;
    
  } catch (error) {
    console.error('❌ Error inserting songs:', error.message);
    throw error;
  }
}

async function createIndexes() {
  try {
    console.log('🔍 Creating database indexes...');
    
    await Song.createIndexes();
    console.log('✅ Database indexes created');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    throw error;
  }
}

async function generateSampleAnalytics() {
  try {
    console.log('📈 Generating sample analytics...');
    
    const stats = await Song.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalSongs: { $sum: 1 },
          avgEnergy: { $avg: '$audioFeatures.energy' },
          avgValence: { $avg: '$audioFeatures.valence' },
          avgDanceability: { $avg: '$audioFeatures.danceability' },
          totalPlays: { $sum: '$playCount' },
          totalLikes: { $sum: '$likeCount' }
        }
      }
    ]);
    
    const moodDistribution = await Song.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$mood' },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Database Statistics:');
    console.log(`   Total Songs: ${stats[0]?.totalSongs || 0}`);
    console.log(`   Average Energy: ${(stats[0]?.avgEnergy || 0).toFixed(3)}`);
    console.log(`   Average Valence: ${(stats[0]?.avgValence || 0).toFixed(3)}`);
    console.log(`   Average Danceability: ${(stats[0]?.avgDanceability || 0).toFixed(3)}`);
    console.log(`   Total Plays: ${stats[0]?.totalPlays || 0}`);
    console.log(`   Total Likes: ${stats[0]?.totalLikes || 0}`);
    
    console.log('\n🎭 Mood Distribution:');
    moodDistribution.forEach(mood => {
      console.log(`   ${mood._id}: ${mood.count} songs`);
    });
    
  } catch (error) {
    console.error('❌ Error generating analytics:', error.message);
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding process...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearExistingData();
    
    // Check if CSV file exists
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`CSV file not found at: ${CSV_PATH}`);
    }
    
    // Parse CSV data
    console.log(`📁 Reading CSV file: ${CSV_PATH}`);
    const songs = await parseCSVData();
    
    if (songs.length === 0) {
      throw new Error('No songs found in CSV file');
    }
    
    // Insert songs into database
    const insertedCount = await insertSongs(songs);
    
    // Create indexes
    await createIndexes();
    
    // Generate analytics
    await generateSampleAnalytics();
    
    console.log(`\n🎉 Database seeding completed successfully!`);
    console.log(`   Songs processed: ${songs.length}`);
    console.log(`   Songs inserted: ${insertedCount}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeding if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase();
}

export default seedDatabase; 