const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for MySQL root password
function promptForPassword() {
  return new Promise((resolve) => {
    rl.question('Enter MySQL root password: ', (password) => {
      resolve(password);
    });
  });
}

async function setupDatabase() {
  try {
    console.log('Setting up EventHub database...');
    
    // Get MySQL root password
    const rootPassword = await promptForPassword();
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-database.sql'), 'utf8');
    
    // Execute the SQL script
    const command = `mysql -u root -p${rootPassword}`;
    execSync(command, { input: sqlScript, stdio: ['pipe', 'inherit', 'inherit'] });
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('The database "event-mangement-system" has been created with the following tables:');
    console.log('- events: Stores information about events');
    console.log('- purchases: Stores information about ticket purchases');
    console.log('\nSample data has been added to demonstrate the application.');
    console.log('\nYou can now start the application with:');
    console.log('npm run dev');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Please make sure MySQL is running and your credentials are correct.');
  } finally {
    rl.close();
  }
}

setupDatabase();
