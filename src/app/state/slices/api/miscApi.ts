import {isaacApi} from "./baseApi";
import {School} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import i18next from "i18next";

export const miscApi = isaacApi.enhanceEndpoints({
    addTagTypes: [],
}).injectEndpoints({
    endpoints: (build) => ({
        searchSchools: build.query<School[], { query: string, countryCode: string }>({
            query: (args) => `/schools/?limit=3&query=${encodeURIComponent(args.query)}&countryCode=${encodeURIComponent(args.countryCode)}`,
        }),

        getSchoolById: build.query<School[], string>({
            query: (id: string) => `/schools/?schoolId=${encodeURIComponent(id)}`,
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
                errorTitle: i18next.t("common:contact.formErrorTitle"),
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
    useLazyGetSchoolByIdQuery,
    useGetCountriesQuery,
    useGetPriorityCountriesQuery,
    useSubmitContactFormMutation,
} = miscApi;
