import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function integrateWithExistingDB() {
  let connection: mysql.Connection | undefined;
  
  try {
    console.log('Checking existing event_management_system database...');
    
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'sqlrocks',
      database: process.env.DB_NAME || 'event_management_system',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    
    // Check existing tables
    if (!connection) throw new Error('Database connection failed');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Existing tables in the database:');
    console.log(tables);
    
    // Check if our required tables exist, if not create them
    const tableExists = async (tableName: string) => {
      if (!connection) throw new Error('Database connection failed');
      const [rows] = await connection.query(
        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [process.env.DB_NAME, tableName]
      );
      return (rows as any)[0].count > 0;
    };
    
    // Create events table if it doesn't exist
    if (!(await tableExists('events'))) {
      console.log('Creating events table...');
      if (!connection) throw new Error('Database connection failed');
      await connection.query(`
        CREATE TABLE \`events\` (
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
    } else {
      console.log('Events table already exists.');
    }
    
    // Create purchases table if it doesn't exist
    if (!(await tableExists('purchases'))) {
      console.log('Creating purchases table...');
      if (!connection) throw new Error('Database connection failed');
      await connection.query(`
        CREATE TABLE \`purchases\` (
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
    } else {
      console.log('Purchases table already exists.');
    }
    
    // Clear existing data from our tables
    console.log('Clearing existing data from events and purchases tables...');
    if (!connection) throw new Error('Database connection failed');
    await connection.query('DELETE FROM purchases');
    await connection.query('DELETE FROM events');
    
    // Reset auto-increment
    if (!connection) throw new Error('Database connection failed');
    await connection.query('ALTER TABLE events AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE purchases AUTO_INCREMENT = 1');
    
    // Insert new events with characters from The Office and Friends
    console.log('Adding sample events with The Office and Friends themes...');
    if (!connection) throw new Error('Database connection failed');
    await connection.query(`
      INSERT INTO \`events\` (\`title\`, \`description\`, \`date\`, \`time\`, \`venue\`, \`category\`, \`total_tickets\`, \`available_tickets\`, \`ticket_price\`) VALUES
      ('Dunder Mifflin Annual Conference', 'Join Michael Scott and the team for a day of paper-related festivities and that\\'s what she said jokes', '2025-11-15', '09:00:00', 'Chili\\'s Restaurant, Pune', 'Business', 200, 50, 4999),
      ('Central Perk Live Music Night', 'Featuring Phoebe Buffay with her hit song "Smelly Cat" and other classics', '2025-12-02', '19:00:00', 'Central Perk Cafe, Mumbai', 'Music', 100, 80, 2499),
      ('Schrute Farms Beet Festival', 'Learn beet farming techniques from Dwight Schrute and experience the Schrute family traditions', '2025-10-20', '10:00:00', 'Schrute Farms, Bengaluru', 'Agriculture', 150, 120, 3499),
      ('Monica\\'s Cooking Masterclass', 'Learn gourmet cooking from Monica Geller and compete in a friendly cooking competition', '2025-09-15', '11:00:00', 'Taj Hotel, Delhi', 'Food', 50, 30, 7999)
    `);
    
    // Insert sample purchases with characters from The Office and Friends
    console.log('Adding sample purchases with The Office and Friends characters...');
    if (!connection) throw new Error('Database connection failed');
    await connection.query(`
      INSERT INTO \`purchases\` (\`event_id\`, \`amount\`, \`status\`, \`attendee_name\`, \`attendee_email\`, \`attendee_phone\`, \`payment_method\`) VALUES
      (1, 4999, 'Completed', 'Jim Halpert', 'jim@dundermifflin.com', '9876543210', 'credit'),
      (1, 4999, 'Completed', 'Pam Beesly', 'pam@dundermifflin.com', '9876543211', 'upi'),
      (2, 2499, 'Completed', 'Chandler Bing', 'chandler@friends.com', '9876543212', 'debit'),
      (2, 2499, 'Completed', 'Ross Geller', 'ross@friends.com', '9876543213', 'upi'),
      (3, 3499, 'Completed', 'Kevin Malone', 'kevin@dundermifflin.com', '9876543214', 'credit'),
      (4, 7999, 'Completed', 'Rachel Green', 'rachel@friends.com', '9876543215', 'upi')
    `);
    
    // Verify the updates
    if (!connection) throw new Error('Database connection failed');
    const [events] = await connection.query('SELECT * FROM events');
    console.log('\nUpdated Events:');
    console.log(events);
    
    const [purchases] = await connection.query('SELECT * FROM purchases');
    console.log('\nUpdated Purchases:');
    console.log(purchases);
    
    console.log('\n✅ Database integration completed successfully!');
    console.log('The project is now connected to your event_management_system database');
    console.log('with sample data featuring characters from The Office and Friends.');
    
  } catch (error) {
    console.error('❌ Error integrating with existing database:', error);
    if ((error as any).code === 'ER_BAD_DB_ERROR') {
      console.error(`The database '${process.env.DB_NAME}' does not exist. Please create it first.`);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the integration
integrateWithExistingDB();
