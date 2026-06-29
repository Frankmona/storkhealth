import { PublicClientApplication, ConfidentialClientApplication, Configuration } from "@azure/msal-node";

// Dataverse connection values are read from environment variables.
// Set these in a local `.env` file or your deployment environment.
const DATAVERSE_URL = process.env.DATAVERSE_URL || "https://org710745f5.crm.dynamics.com";
const USERNAME = process.env.DATAVERSE_USERNAME || "frank@sh.co.bw";
const PASSWORD = process.env.DATAVERSE_PASSWORD || "$HcertiFic@te";

// Enable a dev-only mock to avoid MFA/service-account issues locally.
const USE_MOCK = process.env.USE_MOCK_DATAVERSE === 'true';

// To use ROPC (Username/Password), you still need a Client ID registered in Entra ID.
const CLIENT_ID = process.env.AZURE_CLIENT_ID || "098f87b4-ce30-4e16-8253-e0b8a20a5799";
const TENANT_ID = process.env.AZURE_TENANT_ID || "organizations"; 

const msalConfigBase: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
  },
};

const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

let pcaPublic: PublicClientApplication | null = null;
let cca: ConfidentialClientApplication | null = null;

if (CLIENT_SECRET) {
  const msalConf = { ...msalConfigBase, auth: { ...msalConfigBase.auth, clientSecret: CLIENT_SECRET } } as Configuration;
  cca = new ConfidentialClientApplication(msalConf as any);
} else {
  pcaPublic = new PublicClientApplication(msalConfigBase);
}

export async function getDataverseToken() {
  if (USE_MOCK) return "mock-token";
  // Prefer client credentials (app-only) when a client secret is provided — avoids MFA.
  if (cca) {
    try {
      const tokenRequest = {
        scopes: [`${DATAVERSE_URL}/.default`],
      };
      const resp = await cca.acquireTokenByClientCredential(tokenRequest as any);
      return resp?.accessToken;
    } catch (error) {
      console.error("Error acquiring Dataverse token (client credentials):", error);
      throw new Error("Authentication with Dataverse failed (client credentials). Check AZURE_CLIENT_ID/ AZURE_CLIENT_SECRET / TENANT settings.");
    }
  }

  // Fallback to ROPC (username/password) — may fail if MFA is required for the account.
  if (!pcaPublic) {
    pcaPublic = new PublicClientApplication(msalConfigBase);
  }

  try {
    const tokenRequest = {
      scopes: [`${DATAVERSE_URL}/.default`],
      username: USERNAME,
      password: PASSWORD,
    };

    const response = await pcaPublic.acquireTokenByUsernamePassword(tokenRequest as any);
    return response?.accessToken;
  } catch (error) {
    console.error("Error acquiring Dataverse token (ROPC):", error);
    // Surface a more actionable error message for developers.
    throw new Error("Authentication with Dataverse failed (ROPC). Consider configuring client credentials (AZURE_CLIENT_SECRET) or using a service principal exempt from MFA.");
  }
}

export async function fetchFromDataverse(query: string) {
  if (USE_MOCK) {
    console.log("Using mock Dataverse response (USE_MOCK_DATAVERSE=true)");
    return Promise.resolve({ value: [ {
      yips_certificatename: 'TEST123',
      yips_holderfullname: 'Mock User',
      yips_nationalidpassport: '12345',
      yips_certificatestatus: 341150000
    } ] });
  }

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

export async function postToDataverse(entitySet: string, data: any, callerId?: string) {
  if (USE_MOCK) {
    console.log("Mock POST to Dataverse", entitySet, data);
    return Promise.resolve({ ...data, id: "mock-id" });
  }

  const token = await getDataverseToken();
  if (!token) throw new Error("No access token obtained");

  const url = `${DATAVERSE_URL}/api/data/v9.2/${entitySet}`;
  
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8",
      "Prefer": "return=representation"
    };

    if (callerId && callerId !== "unknown" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callerId)) {
      headers["MSCRMCallerID"] = callerId;
    }

  const response = await fetch(url, {
    method: "POST",
    headers,
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

export async function patchToDataverse(entitySet: string, id: string, data: any, callerId?: string) {
  if (USE_MOCK) {
    console.log("Mock PATCH to Dataverse", entitySet, id, data);
    return { success: true };
  }

  const token = await getDataverseToken();
  if (!token) throw new Error("No access token obtained");

  const url = `${DATAVERSE_URL}/api/data/v9.2/${entitySet}(${id})`;
  
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8",
    };

    if (callerId && callerId !== "unknown" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callerId)) {
      headers["MSCRMCallerID"] = callerId;
    }

  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Dataverse API Error (PATCH):", response.status, errorData);
    throw new Error(`Dataverse request failed with status ${response.status}`);
  }

  return { success: true };
}

export async function deleteFromDataverse(entitySet: string, id: string) {
  if (USE_MOCK) {
    console.log("Mock DELETE to Dataverse", entitySet, id);
    return { success: true };
  }

  const token = await getDataverseToken();
  if (!token) throw new Error("No access token obtained");

  const url = `${DATAVERSE_URL}/api/data/v9.2/${entitySet}(${id})`;
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      "Accept": "application/json",
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Dataverse API Error (DELETE):", response.status, errorData);
    throw new Error(`Dataverse request failed with status ${response.status}`);
  }

  return { success: true };
}
