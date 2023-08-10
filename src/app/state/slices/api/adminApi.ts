import {isaacApi} from "./baseApi";
import {
    AdminSearchEndpointParams,
    EmailVerificationStatus,
    MisuseStatisticDTO,
    RegisteredUserDTO,
    UserRole,
    UserSummaryForAdminUsersDTO,
    ChoiceDTO
} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {showSuccessToast} from "../../actions/popups";
import {AdminStatsResponse, ContentErrorsResponse, UserSchoolLookup} from "../../../../IsaacAppTypes";

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

        getSiteStatistics: build.query<AdminStatsResponse, void>({
            query: () => ({
                url: "/admin/stats",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading Site Statistics Failed",
            })
        }),

        // === Admin user management ===

        adminSearchUsers: build.mutation<UserSummaryForAdminUsersDTO[], AdminSearchEndpointParams>({
            query: (params) => ({
                url: "/admin/users",
                method: "GET",
                params
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "User search failed",
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

        adminDeleteUser: build.mutation<void, number>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: "DELETE",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "User deletion failed",
                successTitle: "User deleted",
                successMessage: "Selected user was deleted successfully",
            })
        }),

        adminModifyUserRoles: build.mutation<void, {userIds: number[], role: UserRole}>({
            query: ({userIds, role}) => ({
                url: `/admin/users/change_role/${role}`,
                method: "POST",
                body: userIds,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "User role modification failed",
            })
        }),

        adminModifyUserEmailVerificationStatus: build.mutation<void, {emails: string[], status: EmailVerificationStatus}>({
            query: ({emails, status}) => ({
                url: `/admin/users/change_email_verification_status/${status}/true`,
                method: "POST",
                body: emails,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Email verification status modification failed",
            })
        }),

        adminGetUser: build.query<RegisteredUserDTO, number>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get user",
            }),
        }),

        adminGetUserIdsSchoolLookup: build.query<UserSchoolLookup, number[]>({
            query: (userIds) => ({
                url: `/users/school_lookup?user_ids=${userIds.join(",")}`,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to load user school lookup details",
            })
        }),

        // === Misc ===

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
    useMergeUsersMutation,
    useAdminSearchUsersMutation,
    useAdminDeleteUserMutation,
    useAdminModifyUserRolesMutation,
    useAdminModifyUserEmailVerificationStatusMutation,
    useAdminGetUserQuery,
    useGetSiteStatisticsQuery,
    useAdminGetUserIdsSchoolLookupQuery,
    useGenerateAnswerSpecificationMutation,
} = adminApi;
