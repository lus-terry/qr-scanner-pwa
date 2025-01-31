import { useEffect, useState } from "react";
import QRScanner from "./components/QrScanner";
import "dotenv/config";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;

function App() {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("User granted notification permission.");
    }
  };

  const subscribeToPushNotifications = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();

        if (!existingSubscription) {
          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });

          setSubscription(newSubscription);

          //await fetch("http://localhost:5050/subscribe", {
          await fetch("https://qr-scanner-backend-yszm.onrender.com", {
            method: "POST",
            body: JSON.stringify(newSubscription),
            headers: { "Content-Type": "application/json" },
          });

          if ("SyncManager" in window) {
            await registration.sync.register("sync-qr-data");
            console.log("Background Sync registered.");
          }

          alert("Successfully subscribed to push notifications!");
        } else {
          setSubscription(existingSubscription);
        }
      } catch (error) {
        console.error("Error subscribing to push notifications", error);
      }
    } else {
      alert("Push notifications are not supported in this browser.");
    }
  };

  return (
    <div className="app-container">
      <div className="content">
        <h1>QR Scanner</h1>
        <button className="pretty-button" onClick={subscribeToPushNotifications}>
          Enable Push Notifications
        </button>
        <QRScanner />
      </div>
    </div>
  );
}

export default App;
