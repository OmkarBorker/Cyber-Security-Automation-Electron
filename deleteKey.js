const keytar = require('keytar');

const SERVICE_NAME = "report-generator";


async function deleteLicenseKey() {
    try {
        const result = await keytar.deletePassword(SERVICE_NAME, "license_key");
        console.log("License key deleted:", result);
    } catch (error) {
        console.error("Error deleting license key:", error);
    }
}
deleteLicenseKey();
