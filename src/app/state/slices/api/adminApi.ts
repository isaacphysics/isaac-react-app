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
import i18next from "i18next";

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
                errorTitle: i18next.t("common:admin.misuseStatistics.errorTitle")
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
                errorTitle: i18next.t("common:admin.misuseMonitor.resetErrorTitle"),
                onQuerySuccess: ({eventLabel}, _, {dispatch}) => {
                    dispatch(showSuccessToast(i18next.t("common:admin.misuseMonitor.resetSuccessTitle"), i18next.t("common:admin.misuseMonitor.resetSuccessMessage", { eventLabel: eventLabel.replace("MisuseHandler", "") })));
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
                errorTitle: i18next.t("common:admin.contentErrors.errorTitle"),
            })
        }),

        getSiteStatistics: build.query<AdminStatsResponse, void>({
            query: () => ({
                url: "/admin/stats",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.siteStatistics.errorTitle"),
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
                errorTitle: i18next.t("common:admin.users.searchErrorTitle"),
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
                errorTitle: i18next.t("common:admin.users.mergeErrorTitle"),
                onQuerySuccess: ({targetId, sourceId}, _, {dispatch}) => {
                    dispatch(showSuccessToast(i18next.t("common:admin.users.mergeSuccessTitle"), i18next.t("common:admin.users.mergeSuccessMessage", { sourceId, targetId })));
                }
            })
        }),

        adminDeleteUser: build.mutation<void, number>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: "DELETE",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.users.deleteErrorTitle"),
                successTitle: i18next.t("common:admin.users.deleteSuccessTitle"),
                successMessage: i18next.t("common:admin.users.deleteSuccessMessage"),
            })
        }),

        adminModifyUserRoles: build.mutation<void, {userIds: number[], role: UserRole}>({
            query: ({userIds, role}) => ({
                url: `/admin/users/change_role/${role}`,
                method: "POST",
                body: userIds,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.users.modifyRoleErrorTitle"),
            })
        }),

        adminModifyUserEmailVerificationStatus: build.mutation<void, {emails: string[], status: EmailVerificationStatus}>({
            query: ({emails, status}) => ({
                url: `/admin/users/change_email_verification_status/${status}/true`,
                method: "POST",
                body: emails,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.users.modifyEmailVerificationErrorTitle"),
            })
        }),

        adminGetUser: build.query<RegisteredUserDTO, number>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.users.getUserErrorTitle"),
            }),
        }),

        adminGetUserIdsSchoolLookup: build.query<UserSchoolLookup, number[]>({
            query: (userIds) => ({
                url: `/users/school_lookup?user_ids=${userIds.join(",")}`,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.users.getSchoolLookupErrorTitle"),
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
                errorTitle: i18next.t("common:questions.generateAnswerSpec.errorTitle"),
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
