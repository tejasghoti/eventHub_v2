import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateToIndianContext() {
  let connection;
  
  try {
    console.log('Updating EventHub database to Indian context...');
    
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'sqlrocks',
      database: process.env.DB_NAME || 'event-mangement-system',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    // Clear existing data
    await connection.query('DELETE FROM purchases');
    await connection.query('DELETE FROM events');
    
    // Reset auto-increment
    await connection.query('ALTER TABLE events AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE purchases AUTO_INCREMENT = 1');
    
    // Insert new events with Indian context
    // Conversion rate: 1 USD = approximately 83 INR
    await connection.query(`
      INSERT INTO \`events\` (\`title\`, \`description\`, \`date\`, \`time\`, \`venue\`, \`category\`, \`total_tickets\`, \`available_tickets\`, \`ticket_price\`) VALUES
      ('Tech Utsav 2025', 'Annual technology conference featuring top industry leaders from across India', '2025-11-15', '09:00:00', 'Pragati Maidan, New Delhi', 'Technology', 200, 50, 8299),
      ('Sangeet Samaroh 2025', 'Weekend music festival with multiple stages and renowned Indian artists', '2025-12-02', '14:00:00', 'Juhu Beach, Mumbai', 'Music', 500, 120, 6639)
    `);
    console.log('Sample events updated with Indian context.');
    
    // Insert sample purchase with Indian context
    await connection.query(`
      INSERT INTO \`purchases\` (\`event_id\`, \`amount\`, \`status\`, \`attendee_name\`, \`attendee_email\`, \`attendee_phone\`, \`payment_method\`) VALUES
      (1, 8299, 'Completed', 'Rajesh Kumar', 'rajesh@example.com', '9876543210', 'upi')
    `);
    console.log('Sample purchase updated with Indian context.');
    
    // Verify the updates
    const [events] = await connection.query('SELECT * FROM events');
    console.log('\nUpdated Events:');
    console.log(events);
    
    const [purchases] = await connection.query('SELECT * FROM purchases');
    console.log('\nUpdated Purchases:');
    console.log(purchases);
    
    console.log('\n✅ Database updated successfully to Indian context!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the update
updateToIndianContext();
