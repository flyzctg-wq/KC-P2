import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export const isNative = Capacitor.isNativePlatform();

/**
 * Ensures the Android high-priority notification channel is created
 */
export async function initNotificationChannels() {
  if (!isNative) return;
  try {
    await LocalNotifications.createChannel({
      id: "kunjachaya_alerts",
      name: "Kunjachaya Club Alerts",
      description: "Emergency notices, dues reminders, and club updates",
      importance: 5, // High importance (heads-up banner, plays sound, vibrates)
      visibility: 1, // Public on lockscreen
      sound: "default",
      vibration: true,
      lights: true,
      lightColor: "#15803d",
    });
  } catch (err) {
    console.warn("Failed to create notification channel:", err);
  }
}

/**
 * Checks current notification permission status
 * @returns {Promise<"granted" | "denied" | "prompt" | "unsupported">}
 */
export async function checkNotificationPermission() {
  if (isNative) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display; // "granted", "denied", or "prompt"
    } catch (err) {
      console.warn("Error checking native permissions:", err);
      return "denied";
    }
  }

  // Web fallback
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission === "default" ? "prompt" : Notification.permission;
  }

  return "unsupported";
}

/**
 * Requests notification permission from the system
 * @returns {Promise<"granted" | "denied" | "prompt" | "unsupported">}
 */
export async function requestNotificationPermission() {
  if (isNative) {
    try {
      // Ensure channel is initialized
      await initNotificationChannels();
      const result = await LocalNotifications.requestPermissions();
      return result.display; // "granted" or "denied"
    } catch (err) {
      console.error("Error requesting native permissions:", err);
      return "denied";
    }
  }

  // Web fallback
  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const perm = await Notification.requestPermission();
      return perm === "default" ? "prompt" : perm;
    } catch (err) {
      console.error("Error requesting web notification permissions:", err);
      return "denied";
    }
  }

  return "unsupported";
}

/**
 * Displays a local notification with sound and vibration
 */
export async function showLocalNotification({ title, body, id = null, data = {} }) {
  if (isNative) {
    try {
      await initNotificationChannels();
      const notifId = id ? Number(id) : Math.floor(Date.now() % 1000000);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            channelId: "kunjachaya_alerts",
            sound: "default",
            smallIcon: "ic_launcher",
            extra: data,
          },
        ],
      });
      return true;
    } catch (err) {
      console.warn("Error showing native local notification:", err);
    }
  } else if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/icons/icon-192.png", data });
      return true;
    } catch (err) {
      console.warn("Error showing web notification:", err);
    }
  }
  return false;
}
