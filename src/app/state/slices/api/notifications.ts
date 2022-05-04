import {isaacApi} from "./index";
import {PotentialUser, UserProgress, UserSnapshot} from "../../../../IsaacAppTypes";
import {checkForWebSocket, closeWebSocket} from "./websockets";
import {isLoggedIn} from "../../../services/user";

// Endpoints for handling user notifications and my progress
export const notificationsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getNotifications: build.query<any[], void>({
            query: () => ({
                url: "/notifications",
                method: "GET"
            }),
            providesTags: ["Notifications"]
        }),

        respondToNotification: build.mutation<void, {id: string, response: string}>({
            query: ({id, response}) => ({
                url: `/notifications/${id}/${response}`,
                method: "POST"
            }),
            invalidatesTags: ["Notifications"]
        }),

        // Info for how to implement queries with WebSockets: https://redux-toolkit.js.org/rtk-query/usage/streaming-updates#streaming-update-examples
        myProgress: build.query<UserProgress | null, PotentialUser | null>({
            query: () => ({
                url: "/users/current_user/progress",
                method: "GET"
            }),
            // Only one cache entry can be added for this endpoint, so all subscribed components will use the same websocket
            onCacheEntryAdded: async (user, { cacheDataLoaded, cacheEntryRemoved, dispatch, updateCachedData }) => {
                try {
                    // Wait for the initial query for my progress to finish before proceeding
                    await cacheDataLoaded

                    // If the user is logged in, initiate the websocket connection
                    if (isLoggedIn(user)) checkForWebSocket(user, updateCachedData);

                } catch {}

                await cacheEntryRemoved;

                // WebSocket is always closed on cache entry removal (no components are subscribed to the data anymore)
                closeWebSocket();
            },
            providesTags: [{type: "UserProgress", id: "current_user"}]
        }),

        // Used to poll the snapshot endpoint - only stores the latest snapshot data received from a poll, not from a websocket message
        snapshot: build.query<UserSnapshot | null, void>({
            query: () => ({
                url: "/users/current_user/snapshot",
                method: "GET"
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const snapshot = await queryFulfilled as UserSnapshot;
                    dispatch(notificationsApi.util.updateQueryData("myProgress", null, (progress) => {
                        if (progress) progress.userSnapshot = snapshot;
                    }));
                } catch {}
            }
        }),

        userProgress: build.query<UserProgress | null, string>({
            query: (userIdOfInterest: string) => ({
                url: `/users/${userIdOfInterest}/progress`,
                method: "GET"
            }),
            providesTags: (result, error, userIdOfInterest) => result ? [{type: "UserProgress", id: userIdOfInterest}] : []
        }),
    })
});