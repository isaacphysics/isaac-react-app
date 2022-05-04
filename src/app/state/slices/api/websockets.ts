import {LoggedInUser, UserProgress, UserSnapshot} from "../../../../IsaacAppTypes";
import {store} from "../../store";
import {API_PATH} from "../../../services/constants";
import {PatchCollection, Recipe} from "@reduxjs/toolkit/dist/query/core/buildThunks";
import {isDefined} from "../../../services/miscUtils";
import {notificationsApi} from "./notifications";

let notificationWebSocket: WebSocket | null  = null;
let webSocketCheckTimeout: number | null = null;
let webSocketErrorCount = 0;
let lastKnownServerTime: number | null = null;

const createWebSocket = () => {
    const userAlertsURI = "/user-alerts";
    if (API_PATH.indexOf("http") > -1) {
        // APP and API on separate domains, urlPrefix is full URL:
        return new WebSocket(API_PATH.replace(/^http/, "ws") + userAlertsURI);
    } else {
        // APP and API on same domain, need window.location.origin for full URL:
        return new WebSocket(window.location.origin.replace(/^http/, "ws") + API_PATH + userAlertsURI);
    }
};

const openNotificationSocket = function(updateMyProgress: (updateRecipe: Recipe<UserProgress | null>) => PatchCollection): void {

    if (notificationWebSocket !== null) {
        return;
    }

    // Set up websocket and connect to notification endpoint:
    notificationWebSocket = createWebSocket();

    notificationWebSocket.onopen = function(_event) {
        console.log(`Websocket opened`);
        if (webSocketCheckTimeout !== null) {
            clearTimeout(webSocketCheckTimeout);
        }
        webSocketCheckTimeout = window.setTimeout(checkForWebSocket, 10000);
        webSocketErrorCount = 0; // Reset error count on successful open.
    }

    notificationWebSocket.onmessage = function(event) {
        const websocketMessage = JSON.parse(event.data);
        console.log(`Websocket message received:`);
        console.log(websocketMessage);
        if (websocketMessage.heartbeat) {
            // Update the last known server time from the message heartbeat.
            const newServerTime = websocketMessage.heartbeat;
            if (null !== lastKnownServerTime && new Date(lastKnownServerTime).getDate() !== new Date(newServerTime).getDate()) {
                // If the server time has passed midnight, streaks reset, so request a snapshot update:
                notificationWebSocket?.send("user-snapshot-nudge");
            }
            lastKnownServerTime = newServerTime;
        }

        if (websocketMessage.userSnapshot) {
            updateMyProgress((progress) => {
                if (progress) progress.userSnapshot = websocketMessage.userSnapshot;
            });
        } else if (websocketMessage.notifications) {
            websocketMessage.notifications.forEach(function(entry: any) {
                const notificationMessage = JSON.parse(entry.message);
                // specific user streak update
                if (notificationMessage.dailyStreakRecord && notificationMessage.weeklyStreakRecord) {
                    updateMyProgress((progress) => {
                        if (progress && progress.userSnapshot) {
                            progress.userSnapshot.dailyStreakRecord = notificationMessage.dailyStreakRecord;
                            progress.userSnapshot.weeklyStreakRecord = notificationMessage.weeklyStreakRecord;
                        }
                    });
                }
            });
        }
    }

    notificationWebSocket.onerror = function(error) {
        console.error("WebSocket error:", error);
        // Initiate poll for latest snapshot info
        store.dispatch(notificationsApi.endpoints.snapshot.initiate());
    }


    notificationWebSocket.onclose = function(event) {
        // Check if a server error caused the problem, and if so prevent retrying.
        // The abnormal closure seems to be mainly caused by network interruptions.
        switch (event.code) {
            case 1000:  // 'Normal': should try to reopen connection.
            case 1001:  // 'Going Away': should try to reopen connection.
            case 1006:  // 'Abnormal Closure': should try to reopen connection.
            case 1013:  // 'Try Again Later': should attempt to reopen, but in at least a minute!
                // Cancel any existing WebSocket poll timeout:
                if (webSocketCheckTimeout !== null) {
                    window.clearTimeout(webSocketCheckTimeout);
                }
                // Attempt to re-open the WebSocket later, with timeout depending on close reason:
                if (event.reason === 'TRY_AGAIN_LATER') {
                    // The status code 1013 isn't yet supported properly, and IE/Edge don't support custom codes.
                    // So use the event 'reason' to indicate too many connections, try again in 1 min.
                    console.log("WebSocket endpoint overloaded. Trying again later!")
                    webSocketCheckTimeout = window.setTimeout(checkForWebSocket, 60000);
                } else if (event.reason === "USER_LOGOUT" || event.reason === "CLOSE_WEBSOCKET_CALLED") {
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
                    // Wait a random time between 20s and 60s, and then attempt reconnection:
                    const randomRetryIntervalSeconds = 20 + Math.floor(Math.random() * 40);
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
    }
}

export const checkForWebSocket = function(user: LoggedInUser | null, updateMyProgress: (updateRecipe: Recipe<UserProgress | null>) => PatchCollection, userSnapshot?: UserSnapshot): void {
    try {
        if (notificationWebSocket !== null) {
            console.log("Pinging websocket...");
            if (!userSnapshot) {
                // If we don't have a snapshot, request one.
                notificationWebSocket.send("user-snapshot-nudge");
            } else {
                // Else just ping to keep connection alive.
                notificationWebSocket.send("heartbeat");
            }
            if (webSocketCheckTimeout) {
                window.clearTimeout(webSocketCheckTimeout);
            }
            webSocketCheckTimeout = window.setTimeout(checkForWebSocket, 60000);
        } else if (isDefined(user)) {
            console.log(`Checking websocket for user: ${user?.email}`);
            openNotificationSocket(updateMyProgress);
        }
    } catch (e) {
        console.log("Error establishing WebSocket connection!", e);
    }
}

export const closeWebSocket = function(): void {
    if (notificationWebSocket !== null) {
        notificationWebSocket.close(1000, "CLOSE_WEBSOCKET_CALLED");
        notificationWebSocket = null;
    }
    if (webSocketCheckTimeout !== null) {
        clearTimeout(webSocketCheckTimeout);
        webSocketCheckTimeout = null;
    }
}