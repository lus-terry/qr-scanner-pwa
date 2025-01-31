import "dotenv/config";
import express from "express";
import webPush from "web-push";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const VAPID_KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (!VAPID_KEYS.publicKey || !VAPID_KEYS.privateKey) {
  console.error("ERROR: VAPID keys are missing in .env file!");
  process.exit(1);
}

webPush.setVapidDetails("mailto:your-email@example.com", VAPID_KEYS.publicKey, VAPID_KEYS.privateKey);

let subscriptions = [];

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }
  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscription saved" });
});

app.post("/sendNotification", async (req, res) => {
  const { title, message } = req.body;
  const payload = JSON.stringify({ title, message });

  subscriptions.forEach(subscription => {
    webPush.sendNotification(subscription, payload).catch(err => console.error(err));
  });

  res.status(200).json({ message: "Push notification sent" });
});

app.post("/sync", (req, res) => {
  const data = req.body;
  console.log("Synced data:", data);
  res.status(200).json({ message: "Data synced successfully" });
});

app.listen(PORT, () => {
  //console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Server running on https://qr-scanner-backend-yszm.onrender.com`);
});
    
