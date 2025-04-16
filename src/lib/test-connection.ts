import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  let connection;
  
  try {
    console.log('Testing database connection...');
    console.log('Using the following configuration:');
    console.log(`- Host: ${process.env.DB_HOST}`);
    console.log(`- User: ${process.env.DB_USER}`);
    console.log(`- Database: ${process.env.DB_NAME}`);
    console.log(`- Port: ${process.env.DB_PORT}`);
    
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    // Test the connection
    const [result] = await connection.query('SELECT 1 + 1 AS result');
    console.log('\nConnection test result:', (result as any)[0].result);
    console.log('✅ Database connection is working properly!');
    
    // Check if tables exist
    console.log('\nChecking if tables exist...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in the database:', tables);
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    console.error('\nPlease check your MySQL connection and credentials.');
    console.error('Make sure your .env file contains the correct database credentials.');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testConnection();
