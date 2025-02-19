import axios from 'axios';

const COUCHDB_URL = 'http://localhost:5984';
const COUCHDB_USER = 'admin';
const COUCHDB_PASSWORD = 'password';

const databases = [
  'deployments',
  'steps',
  'prerequisites',
  'info'
];

async function setupCouchDB() {
  try {
    // Create databases
    for (const db of databases) {
      try {
        await axios.put(
          `${COUCHDB_URL}/${db}`,
          {},
          {
            auth: {
              username: COUCHDB_USER,
              password: COUCHDB_PASSWORD
            }
          }
        );
        console.log(`Created database: ${db}`);
      } catch (error: any) {
        if (error.response?.status === 412) {
          console.log(`Database ${db} already exists`);
        } else {
          throw error;
        }
      }
    }

    // Set up CORS
    await axios.put(
      `${COUCHDB_URL}/_node/_local/_config/cors/origins`,
      '"*"',
      {
        auth: {
          username: COUCHDB_USER,
          password: COUCHDB_PASSWORD
        }
      }
    );

    console.log('CouchDB setup completed successfully');
  } catch (error) {
    console.error('Error setting up CouchDB:', error);
  }
}

setupCouchDB(); 