import { PublicClientApplication, Configuration } from "@azure/msal-node";

// Dataverse connection values are read from environment variables.
// Set these in a local `.env` file or your deployment environment.
const DATAVERSE_URL = process.env.DATAVERSE_URL || "https://org710745f5.crm.dynamics.com";
const USERNAME = process.env.DATAVERSE_USERNAME || "frank@sh.co.bw";
const PASSWORD = process.env.DATAVERSE_PASSWORD || "$HcertiFic@te";

// To use ROPC (Username/Password), you still need a Client ID registered in Entra ID.
const CLIENT_ID = process.env.AZURE_CLIENT_ID || "098f87b4-ce30-4e16-8253-e0b8a20a5799";
const TENANT_ID = process.env.AZURE_TENANT_ID || "organizations"; 

const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
  },
};

const pca = new PublicClientApplication(msalConfig);

export async function getDataverseToken() {
  try {
    const tokenRequest = {
      scopes: [`${DATAVERSE_URL}/.default`],
      username: USERNAME,
      password: PASSWORD,
    };

    const response = await pca.acquireTokenByUsernamePassword(tokenRequest);
    return response?.accessToken;
  } catch (error) {
    console.error("Error acquiring Dataverse token:", error);
    throw new Error("Authentication with Dataverse failed.");
  }
}

export async function fetchFromDataverse(query: string) {
  const token = await getDataverseToken();
  if (!token) throw new Error("No access token obtained");

  const url = `${DATAVERSE_URL}/api/data/v9.2/${query}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8",
      "Prefer": "odata.include-annotations=\"*\""
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Dataverse API Error:", response.status, errorData);
    throw new Error(`Dataverse request failed with status ${response.status}`);
  }

  return response.json();
}

export async function postToDataverse(entitySet: string, data: any) {
  const token = await getDataverseToken();
  if (!token) throw new Error("No access token obtained");

  const url = `${DATAVERSE_URL}/api/data/v9.2/${entitySet}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Dataverse API Error (POST):", response.status, errorData);
    throw new Error(`Dataverse request failed with status ${response.status}`);
  }

  // Handle cases where Prefer: return=representation doesn't return body
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : {};
}
