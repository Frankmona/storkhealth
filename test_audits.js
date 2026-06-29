const { ConfidentialClientApplication } = require("@azure/msal-node");

async function run() {
  const msalConf = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID || "098f87b4-ce30-4e16-8253-e0b8a20a5799",
      authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || "organizations"}`,
      clientSecret: process.env.AZURE_CLIENT_SECRET
    }
  };
  const cca = new ConfidentialClientApplication(msalConf);
  const tokenRequest = { scopes: [`${process.env.DATAVERSE_URL || "https://org710745f5.crm.dynamics.com"}/.default`] };
  const token = await cca.acquireTokenByClientCredential(tokenRequest);
  
  const res = await fetch(`${process.env.DATAVERSE_URL || "https://org710745f5.crm.dynamics.com"}/api/data/v9.2/EntityDefinitions?$select=LogicalName,EntitySetName&$filter=contains(LogicalName, 'audit') or contains(LogicalName, 'yips')`, {
    headers: { "Authorization": `Bearer ${token.accessToken}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data.value.map(v => v.EntitySetName), null, 2));
}
run();
