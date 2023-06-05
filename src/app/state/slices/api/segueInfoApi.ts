import {isaacApi} from "./baseApi";
import {onQueryLifecycleEvents} from "./utils";

const updatedIsaacApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        // === Content version endpoints ===

        getContentVersion: build.query<string, void>({
            query: () => ({
                url: "/info/content_versions/live_version",
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading Content Version Failed",
            }),
            transformResponse: (response: { liveVersion: string }) => response.liveVersion
        }),

        updateContentVersion: build.mutation<void, string>({
            query: (version) => ({
                url: `/admin/live_version/${version}`,
                method: "POST",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Updating Content Version Failed",
                onQuerySuccess: (version, _, {dispatch}) => {
                    dispatch(updatedIsaacApi.util.upsertQueryData("getContentVersion", undefined, version));
                }
            })
        }),

        // === Constants endpoints ===

        getConstantUnits: build.query<string[], void>({
            query: () => ({
                url: "/content/units",
                method: "GET",
            }),
            keepUnusedDataFor: 1800, // Half an hour in seconds
        }),

        getSegueVersion: build.query<string, void>({
            query: () => ({
                url: "/info/segue_version",
                method: "GET",
            }),
            transformResponse: (response: {segueVersion: string}) => response.segueVersion,
            keepUnusedDataFor: 604800, // A week in seconds
        }),

        getSegueEnvironment: build.query<string, void>({
            query: () => ({
                url: "/info/segue_environment",
                method: "GET",
            }),
            transformResponse: (response: {segueEnvironment: string}) => response.segueEnvironment,
            keepUnusedDataFor: 604800, // A week in seconds
        }),
    })
});

export const {
    useGetContentVersionQuery,
    useUpdateContentVersionMutation,
    useGetConstantUnitsQuery,
    useGetSegueVersionQuery,
    useGetSegueEnvironmentQuery,
} = updatedIsaacApi;
