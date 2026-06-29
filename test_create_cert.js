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
  
  const payload = {
      "yips_certificatename": `STK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      "yips_holderfullname": "John Doe",
      "yips_nationalidpassport": "A12345678",
      "yips_companyname": "Acme Corp",
      "yips_certificatestatus": 341150000,
      "yips_issuedate": new Date().toISOString(),
      "yips_expirydate": new Date(Date.now() + 31536000000).toISOString(),
  };

  const res = await fetch(`https://org710745f5.crm.dynamics.com/api/data/v9.2/yips_certificateses`, {
    method: 'POST',
    headers: { 
        "Authorization": `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "MSCRMCallerID": "12345678-1234-1234-1234-123456789abc"
    },
    body: JSON.stringify(payload)
  });
  if(res.ok) console.log("POST OK");
  else console.log(res.status, await res.text());
}
run();
