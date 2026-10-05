import {groupsApi} from "./groupsApi";
import {UserSummaryDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {anonymisationFunctions, anonymiseIfNeededWith, onQueryLifecycleEvents} from "./utils";
import {showErrorToast} from "../../actions/popups";
import i18next from "i18next";

export const authorisationsApi = groupsApi.enhanceEndpoints({
    addTagTypes: ["ActiveAuthorisations", "OtherAuthorisations"],
}).injectEndpoints({
    endpoints: (build) => ({
        getActiveAuthorisations: build.query<UserSummaryWithEmailAddressDTO[], number | undefined>({
            query: (userId) => `/authorisations${userId ? `/${userId}` : ""}`,
            providesTags: (result, _, arg) => arg
                ? [{type: "ActiveAuthorisations", id: arg}]
                : ["ActiveAuthorisations"],
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.activeAuthorisations),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:groups.authorisations.loadTeachersErrorTitle")
            })
        }),

        getOtherUserAuthorisations: build.query<UserSummaryDTO[], number | undefined>({
            query: (userId) => `/authorisations/other_users${userId ? `/${userId}` : ""}`,
            providesTags: (result, _, arg) => arg
                ? [{type: "OtherAuthorisations", id: arg}]
                : ["OtherAuthorisations"],
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.otherUserAuthorisations),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:groups.authorisations.loadStudentsErrorTitle")
            })
        }),

        getTokenOwner: build.query<UserSummaryWithEmailAddressDTO[], string>({
            query: (token) => `/authorisations/token/${token}/owner`,
            onQueryStarted: onQueryLifecycleEvents({
                onQueryError: (args, error, {dispatch}) => {
                    if (error.status == 429) {
                        dispatch(showErrorToast(
                            i18next.t("common:groups.authorisations.rateLimitTitle"),
                            i18next.t("common:groups.authorisations.rateLimitMessage")
                        ));
                    } else {
                        dispatch(showErrorToast(
                            i18next.t("common:groups.authorisations.connectionErrorTitle"),
                            i18next.t("common:groups.authorisations.connectionErrorMessage")
                        ));
                    }
                }
            })
        }),

        authenticateWithToken: build.mutation<void, string>({
            query: (token) => ({
                url: `/authorisations/use_token/${token}`,
                method: "POST",
            }),
            invalidatesTags: ["ActiveAuthorisations", "Groups", "GroupMemberships", "MyGroupMemberships", "AllMyAssignments"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: i18next.t("common:groups.authorisations.grantSuccessTitle"),
                successMessage: i18next.t("common:groups.authorisations.grantSuccessMessage"),
                errorTitle: i18next.t("common:groups.authorisations.connectionErrorTitle"),
                errorMessage: i18next.t("common:groups.authorisations.connectionErrorMessage")
            })
        }),

        revokeAuthorisation: build.mutation<void, number>({
            query: (userIdToRevoke) => ({
                url: `/authorisations/${userIdToRevoke}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ActiveAuthorisations"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: i18next.t("common:groups.authorisations.revokeSuccessTitle"),
                successMessage: i18next.t("common:groups.authorisations.revokeSuccessMessage"),
                errorTitle: i18next.t("common:groups.authorisations.revokeErrorTitle"),
            })
        }),

        releaseAuthorisation: build.mutation<void, number>({
            query: (userIdToRelease) => ({
                url: `/authorisations/release/${userIdToRelease}`,
                method: "DELETE",
            }),
            invalidatesTags: ["OtherAuthorisations"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: i18next.t("common:groups.authorisations.releaseSuccessTitle"),
                successMessage: i18next.t("common:groups.authorisations.releaseSuccessMessage"),
                errorTitle: i18next.t("common:groups.authorisations.releaseErrorTitle"),
            })
        }),

        releaseAllAuthorisations: build.mutation<void, void>({
            query: () => ({
                url: "/authorisations/release",
                method: "DELETE",
            }),
            invalidatesTags: ["OtherAuthorisations"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: i18next.t("common:groups.authorisations.releaseSuccessTitle"),
                successMessage: i18next.t("common:groups.authorisations.releaseAllSuccessMessage"),
                errorTitle: i18next.t("common:groups.authorisations.releaseErrorTitle"),
            })
        })
    })
});

export const {
    useGetActiveAuthorisationsQuery,
    useGetOtherUserAuthorisationsQuery,
    useLazyGetTokenOwnerQuery
} = authorisationsApi;
