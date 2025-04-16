import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Attempting to set up the EventHub database...');
    
    // First, connect to MySQL without specifying a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'eventhub_user',
      password: process.env.DB_PASSWORD || 'eventhub_password',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'event-mangement-system'}\``);
    console.log(`Database '${process.env.DB_NAME || 'event-mangement-system'}' created or already exists.`);
    
    // Use the database
    await connection.query(`USE \`${process.env.DB_NAME || 'event-mangement-system'}\``);
    
    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`events\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`date\` DATE NOT NULL,
        \`time\` TIME NOT NULL,
        \`venue\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`total_tickets\` INT NOT NULL,
        \`available_tickets\` INT NOT NULL,
        \`ticket_price\` DECIMAL(10, 2) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Events table created or already exists.');
    
    // Create purchases table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`purchases\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`event_id\` INT NOT NULL,
        \`purchase_date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`amount\` DECIMAL(10, 2) NOT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'Completed',
        \`attendee_name\` VARCHAR(255) NOT NULL,
        \`attendee_email\` VARCHAR(255) NOT NULL,
        \`attendee_phone\` VARCHAR(50),
        \`payment_method\` VARCHAR(50) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE
      )
    `);
    console.log('Purchases table created or already exists.');
    
    // Check if there are any events in the database
    const [events] = await connection.query('SELECT COUNT(*) as count FROM events');
    const eventCount = (events as any)[0].count;
    
    // Insert sample data if the tables are empty
    if (eventCount === 0) {
      // Insert sample events
      await connection.query(`
        INSERT INTO \`events\` (\`title\`, \`description\`, \`date\`, \`time\`, \`venue\`, \`category\`, \`total_tickets\`, \`available_tickets\`, \`ticket_price\`) VALUES
        ('Tech Conference 2025', 'Annual technology conference featuring top industry speakers', '2025-11-15', '09:00:00', 'Convention Center', 'Technology', 200, 50, 99.99),
        ('Music Festival 2025', 'Weekend music festival with multiple stages and artists', '2025-12-02', '14:00:00', 'Central Park', 'Music', 500, 120, 79.99)
      `);
      console.log('Sample events added to the database.');
      
      // Insert sample purchase
      await connection.query(`
        INSERT INTO \`purchases\` (\`event_id\`, \`amount\`, \`status\`, \`attendee_name\`, \`attendee_email\`, \`attendee_phone\`, \`payment_method\`) VALUES
        (1, 99.99, 'Completed', 'John Doe', 'john@example.com', '123-456-7890', 'credit')
      `);
      console.log('Sample purchase added to the database.');
    } else {
      console.log('Database already contains events. Skipping sample data insertion.');
    }
    
    console.log('\n✅ Database setup completed successfully!');
    console.log(`Database '${process.env.DB_NAME || 'event-mangement-system'}' is ready to use with the EventHub application.`);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.error('Please check your MySQL connection and credentials.');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase();
