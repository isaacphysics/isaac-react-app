import {isaacApi} from "./baseApi";
import {ChoiceDTO, MisuseStatisticDTO} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {showSuccessToast} from "../../actions/popups";
import {ContentErrorsResponse} from "../../../../IsaacAppTypes";

const updatedIsaacApi = isaacApi.enhanceEndpoints({
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

        generateAnswerSpecification: build.mutation<string[], ChoiceDTO>({
            query: (choice) => ({
                url: "/questions/generateSpecification",
                method: "POST",
                body: choice
            }),
            transformResponse: (response: {results: string[], totalResults: number}) => response.results,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "There was a problem generating an answer specification",
            })
        }),
    })
});

export const {
    useGetMisuseStatisticsQuery,
    useResetMisuseMonitorMutation,
    useGetContentErrorsQuery,
    useGenerateAnswerSpecificationMutation,
} = updatedIsaacApi;
