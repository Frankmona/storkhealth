import { fetchFromDataverse } from "./src/lib/dataverse.ts";
async function run() {
  try {
    const res = await fetchFromDataverse("EntityDefinitions?$select=LogicalName,EntitySetName&$filter=contains(LogicalName, 'medical')");
    console.log(JSON.stringify(res.value, null, 2));
  } catch(e) {
    console.log(e);
  }
}
run();
