import {groupsApi} from "./groupsApi";
import {UserSummaryDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {anonymisationFunctions, anonymiseIfNeededWith, onQueryLifecycleEvents} from "./utils";
import {showErrorToast} from "../../actions/popups";

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
                errorTitle: "Loading authorised teachers failed"
            })
        }),

        getOtherUserAuthorisations: build.query<UserSummaryDTO[], number | undefined>({
            query: (userId) => `/authorisations/other_users${userId ? `/${userId}` : ""}`,
            providesTags: (result, _, arg) => arg
                ? [{type: "OtherAuthorisations", id: arg}]
                : ["OtherAuthorisations"],
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.otherUserAuthorisations),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading authorised students failed"
            })
        }),

        getTokenOwner: build.query<UserSummaryWithEmailAddressDTO[], string>({
            query: (token) => `/authorisations/token/${token}/owner`,
            onQueryStarted: onQueryLifecycleEvents({
                onQueryError: (args, error, {dispatch}) => {
                    if (error.status == 429) {
                        dispatch(showErrorToast(
                            "Too many attempts",
                            "You have entered too many group codes. Please check your code with your teacher and try again later!"
                        ));
                    } else {
                        dispatch(showErrorToast(
                            "Teacher connection failed",
                            "The code may be invalid or the group may no longer exist. Codes are usually uppercase and 6-8 characters in length."
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
                successTitle: "Granted access",
                successMessage: "ou have granted access to your data.",
                errorTitle: "Teacher connection failed",
                errorMessage: "The code may be invalid or the group may no longer exist. Codes are usually uppercase and 6-8 characters in length."
            })
        }),

        revokeAuthorisation: build.mutation<void, number>({
            query: (userId) => ({
                url: `/authorisations/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ActiveAuthorisations"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Access revoked",
                successMessage: "You have revoked access to your data.",
                errorTitle: "Revoking access failed",
            })
        }),

        releaseAuthorisation: build.mutation<void, number>({
            query: (userId) => ({
                url: `/authorisations/release/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["OtherAuthorisations"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Access removed",
                successMessage: "You have ended your access to your student's data.",
                errorTitle: "Ending access failed",
            })
        }),

        releaseAllAuthorisations: build.mutation<void, void>({
            query: () => ({
                url: "/authorisations/release",
                method: "DELETE",
            }),
            invalidatesTags: ["OtherAuthorisations"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Access removed",
                successMessage: "You have ended your access to all of your students' data.",
                errorTitle: "Ending access failed",
            })
        })
    })
});

export const {
    useGetActiveAuthorisationsQuery,
    useGetOtherUserAuthorisationsQuery,
    useLazyGetTokenOwnerQuery
} = authorisationsApi;
