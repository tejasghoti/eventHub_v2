import { testConnection } from './db';

// Test the database connection
async function main() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ Database connection successful!');
    } else {
      console.error('❌ Database connection failed!');
    }
  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  }
}

main();
