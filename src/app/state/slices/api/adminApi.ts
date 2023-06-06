import {isaacApi} from "./baseApi";
import {MisuseStatisticDTO} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {showSuccessToast} from "../../actions/popups";
import {ContentErrorsResponse} from "../../../../IsaacAppTypes";

export const adminApi = isaacApi.enhanceEndpoints({
    addTagTypes: ["MisuseStatistics"],
}).injectEndpoints({
    endpoints: (build) => ({

        getMisuseStatistics: build.query<{[eventLabel: string]: MisuseStatisticDTO[]}, number>({
            query: (n) => ({
                url: `/admin/misuse_stats?limit=${n}`,
                method: "GET",
            }),
            providesTags: ["MisuseStatistics"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get misuse statistics for user"
            })
        }),

        resetMisuseMonitor: build.mutation<void, {eventLabel: string, agentIdentifier: string}>({
            query: ({eventLabel, agentIdentifier}) => ({
                url: `/admin/reset_misuse_monitor`,
                method: "POST",
                body: {
                    eventLabel,
                    agentIdentifier
                }
            }),
            invalidatesTags: ["MisuseStatistics"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to reset misuse monitor for user",
                onQuerySuccess: ({eventLabel}, _, {dispatch}) => {
                    dispatch(showSuccessToast("Reset successfully", `${eventLabel.replace("MisuseHandler", "")} misuse event count reset for user`));
                },
            })
        }),

        getContentErrors: build.query<ContentErrorsResponse, void>({
            query: () => ({
                url: "/admin/content_problems",
                method: "GET",
            }),
            providesTags: ["ContentErrors"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading Content Errors Failed",
            })
        }),

        mergeUsers: build.mutation<void, {targetId: number, sourceId: number}>({
            query: ({targetId, sourceId}) => ({
                url: "/admin/users/merge",
                method: "POST",
                body: {
                    targetId,
                    sourceId
                }
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Merging users failed",
                onQuerySuccess: ({targetId, sourceId}, _, {dispatch}) => {
                    dispatch(showSuccessToast("Users merged", `User with id: ${sourceId} was merged into user with id: ${targetId}`));
                }
            })
        }),
    })
});

export const {
    useGetMisuseStatisticsQuery,
    useResetMisuseMonitorMutation,
    useGetContentErrorsQuery,
    useMergeUsersMutation,
} = adminApi;
