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
  
  const res = await fetch(`https://org710745f5.crm.dynamics.com/api/data/v9.2/yips_verificationhistories?$top=1`, {
    headers: { "Authorization": `Bearer ${token.accessToken}` }
  });
  if(res.ok) console.log("yips_verificationhistories OK");
  else console.log(res.status, await res.text());
}
run();
