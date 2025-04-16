import mysql, { ResultSetHeader, RowDataPacket, OkPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event-mangement-system',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to execute SQL queries
export async function query<T extends RowDataPacket[] | OkPacket | ResultSetHeader>(
  sql: string, 
  params: any[] = []
): Promise<T> {
  try {
    const [results] = await pool.execute<T>(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Test the database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default { query, testConnection };
