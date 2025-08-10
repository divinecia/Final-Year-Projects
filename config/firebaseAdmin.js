import * as admin from "firebase-admin";
import serviceAccount from "./househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json" assert { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

export default admin;
