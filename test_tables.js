require('dotenv').config({ path: '.env' });
const { ConfidentialClientApplication } = require("@azure/msal-node");

async function run() {
  const msalConf = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
      clientSecret: process.env.AZURE_CLIENT_SECRET
    }
  };
  const cca = new ConfidentialClientApplication(msalConf);
  const tokenRequest = { scopes: [`https://org710745f5.crm.dynamics.com/.default`] };
  const token = await cca.acquireTokenByClientCredential(tokenRequest);
  
  const res = await fetch(`https://org710745f5.crm.dynamics.com/api/data/v9.2/EntityDefinitions?$select=LogicalName,DisplayName`, {
    headers: { "Authorization": `Bearer ${token.accessToken}` }
  });
  const data = await res.json();
  const tables = data.value.filter(t => t.LogicalName.includes("yips_"));
  console.log(JSON.stringify(tables.map(t => t.LogicalName), null, 2));
}
run();
