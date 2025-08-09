import * as admin from "firebase-admin";
import * as path from "path";

const serviceAccount = require(path.join(__dirname, "househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;
