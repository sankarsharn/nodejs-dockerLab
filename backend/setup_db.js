const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.DB_NAME || 'library_db';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 5432;

console.log(`Attempting to connect to PostgreSQL at ${host}:${port} as ${user}...`);

const client = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres' // Connect to default 'postgres' database first
});

async function setupDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL server.');

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`Database '${dbName}' does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

    } catch (err) {
        console.error('Error setting up database:', err.message);
        console.log('\nPossible fixes:');
        console.log('1. Make sure PostgreSQL is installed and running.');
        console.log('2. Check your .env file credentials (DB_USER, DB_PASSWORD).');
        console.log('3. Ensure the user has permission to create databases.');
    } finally {
        await client.end();
    }
}

setupDatabase();
