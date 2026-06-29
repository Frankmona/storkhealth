require('dotenv').config({ path: '.env.local' });
const { fetchFromDataverse } = require('./src/lib/dataverse.ts'); // Wait, dataverse.ts is TypeScript, I can't require it directly.
