import { api, isLoggedIn } from "./";
import { getSnapshot, partiallyUpdateUserSnapshot, store } from "../state";

let notificationWebSocket: WebSocket | null = null;
let webSocketCheckTimeout: number | null = null;
let webSocketErrorCount = 0;
let lastKnownServerTime: number | null = null;

const openNotificationSocket = function (): void {
  if (notificationWebSocket !== null) {
    return;
  }

  // Slightly hacky check that we are in fact logged in:
  if (!isLoggedIn(store.getState().user)) {
    return;
  }

  // Set up websocket and connect to notification endpoint:
  notificationWebSocket = api.websockets.userAlerts();

  notificationWebSocket.onopen = function () {
    if (webSocketCheckTimeout !== null) {
      clearTimeout(webSocketCheckTimeout);
    }
    webSocketCheckTimeout = window.setTimeout(checkForWebSocket, 10000);
    webSocketErrorCount = 0; // Reset error count on successful open.
  };

  notificationWebSocket.onmessage = function (event) {
    const websocketMessage = JSON.parse(event.data);

    if (websocketMessage.heartbeat) {
      // Update the last known server time from the message heartbeat.
      const newServerTime = websocketMessage.heartbeat;
      if (
        null !== lastKnownServerTime &&
        new Date(lastKnownServerTime).getDate() !== new Date(newServerTime).getDate()
      ) {
        // If the server time has passed midnight, streaks reset, so request a snapshot update:
        notificationWebSocket?.send("user-snapshot-nudge");
      }
      lastKnownServerTime = newServerTime;
    }

    if (websocketMessage.userSnapshot) {
      store.dispatch(partiallyUpdateUserSnapshot(websocketMessage.userSnapshot));
    } else if (websocketMessage.notifications) {
      websocketMessage.notifications.forEach(function (entry: any) {
        const notificationMessage = JSON.parse(entry.message);
        // specific user streak update
        if (notificationMessage.dailyStreakRecord && notificationMessage.weeklyStreakRecord) {
          store.dispatch(
            partiallyUpdateUserSnapshot({
              dailyStreakRecord: notificationMessage.dailyStreakRecord,
              weeklyStreakRecord: notificationMessage.weeklyStreakRecord,
            }),
          );
        }
      });
    }
  };

  notificationWebSocket.onerror = function (error) {
    console.error("WebSocket error:", error);
    store.dispatch(getSnapshot());
  };

  notificationWebSocket.onclose = function (event) {
    // Check if a server error caused the problem, and if so prevent retrying.
    // The abnormal closure seems to be mainly caused by network interruptions.
    switch (event.code) {
      case 1000: // 'Normal': should try to reopen connection.
      case 1001: // 'Going Away': should try to reopen connection.
      case 1006: // 'Abnormal Closure': should try to reopen connection.
      case 1013: // 'Try Again Later': should attempt to reopen, but in at least a minute!
        // Cancel any existing WebSocket poll timeout:
        if (webSocketCheckTimeout !== null) {
          window.clearTimeout(webSocketCheckTimeout);
        }
        // Attempt to re-open the WebSocket later, with timeout depending on close reason:
        if (event.reason === "TRY_AGAIN_LATER") {
          // The status code 1013 isn't yet supported properly, and IE/Edge don't support custom codes.
          // So use the event 'reason' to indicate too many connections, try again in 1 min.
          console.log("WebSocket endpoint overloaded. Trying again later!");
          webSocketCheckTimeout = window.setTimeout(checkForWebSocket, 60000);
        } else if (event.reason === "USER_LOGOUT") {
          // This was intentional and client generated. Do not attempt to reopen the WebSocket.
          break;
        } else {
          webSocketErrorCount += 1;
          // If too many errors have occurred whilst re-trying, abort:
          if (webSocketErrorCount >= 3) {
            console.error("WebSocket reconnect failed multiple times. Aborting retry!");
            break;
          }
          // This is likely a network interrupt or else a server restart.
          // For the latter, we really don't want all reconnections at once.
          // Wait a random time between 30s and 90s, and then attempt reconnection:
          const randomRetryIntervalSeconds = 30 + Math.floor(Math.random() * 60);
          console.log("WebSocket connection lost. Reconnect attempt in " + randomRetryIntervalSeconds + "s.");
          webSocketCheckTimeout = window.setTimeout(checkForWebSocket, randomRetryIntervalSeconds * 1000);
        }
        break;
      default: // Unexpected closure code: log and abort retrying!
        console.error("WebSocket closed by server error (Code " + event.code + "). Aborting retry!");
        if (webSocketCheckTimeout !== null) {
          window.clearTimeout(webSocketCheckTimeout);
        }
    }
    notificationWebSocket = null;
  };
};

export const checkForWebSocket = function (): void {
  try {
    if (notificationWebSocket !== null) {
      if (!store.getState()?.myProgress?.userSnapshot) {
        // If we don't have a snapshot, request one.
        notificationWebSocket.send("user-snapshot-nudge");
      } else {
        // Else just ping to keep connection alive; we'll get updates sent by the server.
        notificationWebSocket.send("heartbeat");
      }
      if (webSocketCheckTimeout) {
        window.clearTimeout(webSocketCheckTimeout);
      }
      webSocketCheckTimeout = window.setTimeout(checkForWebSocket, 60000);
    } else {
      openNotificationSocket();
    }
  } catch (e) {
    console.log("Error establishing WebSocket connection!", e);
  }
};

export const closeWebSocket = function (): void {
  if (notificationWebSocket !== null) {
    notificationWebSocket.close(1000, "USER_LOGOUT");
    notificationWebSocket = null;
  }
  if (webSocketCheckTimeout !== null) {
    clearTimeout(webSocketCheckTimeout);
    webSocketCheckTimeout = null;
  }
};
