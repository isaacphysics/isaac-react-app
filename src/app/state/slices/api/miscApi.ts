import {isaacApi} from "./baseApi";
import {School} from "../../../../IsaacAppTypes";
import {onQueryLifecycleEvents} from "./utils";

export const miscApi = isaacApi.enhanceEndpoints({
    addTagTypes: [],
}).injectEndpoints({
    endpoints: (build) => ({
        searchSchools: build.query<School[], string>({
            query: (query: string) => `/schools/?limit=3&query=${encodeURIComponent(query)}`,
        }),

        getSchoolByUrn: build.query<School[], string>({
            query: (urn: string) => `/schools/?urn=${encodeURIComponent(urn)}`,
        }),

        getCountries: build.query<Record<string, string>, void>({
            query: () => "/countries",
        }),

        getPriorityCountries: build.query<Record<string, string>, void>({
            query: () => "/countries/priority",
        }),

        submitContactForm: build.mutation<void, {firstName: string; lastName: string; emailAddress: string; subject: string; message: string }>({
            query: (params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string }) => ({
                url: "/contact/",
                method: "POST",
                body: params,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Error sending Contact Us form",
            })
        }),

        log: build.mutation<void, object>({
            query: (eventDetails: object) => ({
                url: `/log`,
                method: "POST",
                body: eventDetails,
            })
        }),
    })
});

export const {
    useLazySearchSchoolsQuery,
    useLazyGetSchoolByUrnQuery,
    useGetCountriesQuery,
    useGetPriorityCountriesQuery,
    useSubmitContactFormMutation,
} = miscApi;
