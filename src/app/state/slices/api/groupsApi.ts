import {assignmentsApi} from "./assignmentsApi";
import {AppGroup, AppGroupMembership, AppGroupTokenDTO, GroupMembershipDetailDTO} from "../../../../IsaacAppTypes";
import {
    anonymisationFunctions,
    anonymiseIfNeededWith,
    anonymiseListIfNeededWith,
    onQueryLifecycleEvents
} from "./utils";
import {isDefined, MEMBERSHIP_STATUS} from "../../../services";
import {showSuccessToast} from "../../actions/popups";
import {UserSummaryWithGroupMembershipDTO} from "../../../../IsaacApiTypes";
import i18next from "i18next";

export const groupsApi = assignmentsApi.injectEndpoints({
    endpoints: (build) => ({

        getGroups: build.query<AppGroup[], boolean>({
            query: (archivedGroupsOnly) => ({
                url: `/groups?archived_groups_only=${archivedGroupsOnly}`
            }),
            providesTags: ["Groups"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:groups.fetch.errorTitle")
            }),
            transformResponse: anonymiseListIfNeededWith(anonymisationFunctions.appGroup),
            keepUnusedDataFor: 60
        }),

        createGroup: build.mutation<AppGroup, string>({
            query: (groupName) => ({
                method: "POST",
                url: "/groups",
                body: {groupName},
            }),
            invalidatesTags: ["AllSetAssignments", "AllMyAssignments", "AllSetTests", "AssignmentProgress"],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (_, newGroup, {dispatch}) => {
                    // Created groups are active by default, so don't need to update cache for archived groups
                    dispatch(groupsApi.util.updateQueryData(
                        "getGroups",
                        false,
                        (groups) => [...groups, newGroup]
                    ));
                },
                errorTitle: () => i18next.t("common:groups.create.errorTitle")
            }),
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.appGroup)
        }),

        deleteGroup: build.mutation<void, number>({
            query: (groupId) => ({
                method: "DELETE",
                url: `/groups/${groupId}`,
            }),
            invalidatesTags: (_, error, groupId) => ["AllSetAssignments", "AllMyAssignments", "AllSetTests", "AssignmentProgress", {type: "GroupAssignments", id: groupId}, {type: "GroupTests", id: groupId}],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (groupId, _, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => dispatch(groupsApi.util.updateQueryData(
                        "getGroups",
                        archivedGroupsOnly,
                        (groups) => groups.filter(g => g.id !== groupId)
                    )));
                },
                errorTitle: () => i18next.t("common:groups.delete.errorTitle")
            })
        }),

        updateGroup: build.mutation<void, {updatedGroup: AppGroup; message?: string}>({
            query: ({updatedGroup}) => ({
                method: "POST",
                url: `/groups/${updatedGroup.id}`,
                body: {...updatedGroup, members: undefined}
            }),
            invalidatesTags: (_, error, {updatedGroup}) => !isDefined(error) ? [{type: "GroupAssignments", id: updatedGroup.id}] : [],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({updatedGroup, message}, _, {dispatch}) => {
                    if (message) {
                        dispatch(showSuccessToast(i18next.t("common:groups.update.successTitle"), message));
                    }
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(groupsApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) => {
                                // If updatedGroup should be in this list (archived or active) ...
                                if (updatedGroup.archived === archivedGroupsOnly) {
                                    // ... and actually is ...
                                    if (groups.find(g => g.id === updatedGroup.id)) {
                                        // ... then update the existing entry ...
                                        return groups.map(g => g.id === updatedGroup.id ? updatedGroup : g);
                                    } else {
                                        // ... otherwise, add it to the list.
                                        return groups.concat([updatedGroup]);
                                    }
                                } else {
                                    // If updatedGroup shouldn't be in the list, make sure that it isn't
                                    return groups.filter(g => g.id !== updatedGroup.id);
                                }
                            })
                        );
                    });
                },
                errorTitle: () => i18next.t("common:groups.update.errorTitle")
            })
        }),

        // --- Group members and memberships ---

        getGroupMemberships: build.query<GroupMembershipDetailDTO[], number | undefined>({
            query: (userId) => ({
                url: userId ? `/groups/membership/${userId}` : "/groups/membership"
            }),
            providesTags: (_, __, userId) => userId ? [{type: "GroupMemberships", id: userId}] : ["MyGroupMemberships"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:groups.memberships.fetch.errorTitle")
            }),
            transformResponse: anonymiseListIfNeededWith<GroupMembershipDetailDTO>(anonymisationFunctions.groupMembershipDetail)
        }),

        changeMyMembershipStatus: build.mutation<void, {groupId: number, newStatus: MEMBERSHIP_STATUS}>({
            query: ({groupId, newStatus}) => ({
                method: "POST",
                url: `/groups/membership/${groupId}/${newStatus}`
            }),
            invalidatesTags: ["MyGroupMemberships"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: () => i18next.t("common:groups.memberships.updateStatus.successTitle"),
                successMessage: () => i18next.t("common:groups.memberships.updateStatus.successMessage"),
                errorTitle: () => i18next.t("common:groups.memberships.updateStatus.errorTitle")
            }),
        }),

        getGroupMembers: build.query<UserSummaryWithGroupMembershipDTO[], number>({
            query: (groupId) => ({
                url: `/groups/${groupId}/membership`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (groupId, members, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(groupsApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupId
                                    ? {...g, members: members as AppGroupMembership[]}
                                    : g
                                )
                        ));
                    });
                },
                errorTitle: () => i18next.t("common:groups.members.fetch.errorTitle")
            }),
            keepUnusedDataFor: 0,
            transformResponse: anonymiseListIfNeededWith<UserSummaryWithGroupMembershipDTO>(anonymisationFunctions.userSummary())
        }),

        deleteGroupMember: build.mutation<void, {groupId: number, userId: number}>({
            query: ({groupId, userId}) => ({
                method: "DELETE",
                url: `/groups/${groupId}/membership/${userId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({groupId, userId}, _, {dispatch, getState}) => {
                    const currentUserId = getState().user.id;
                    if (currentUserId === userId) {
                        dispatch(assignmentsApi.util.invalidateTags(["AllMyAssignments", "MyGroupMemberships", "Groups"]));
                    }
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(groupsApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupId
                                    ? {...g, members: g.members?.filter(m => m.id !== userId)}
                                    : g
                                )
                        ));
                    });
                },
                successTitle: () => i18next.t("common:groups.members.remove.successTitle"),
                successMessage: () => i18next.t("common:groups.members.remove.successMessage"),
                errorTitle: () => i18next.t("common:groups.members.remove.errorTitle"),
                errorMessage: () => i18next.t("common:groups.members.remove.errorMessage")
            })
        }),

        // --- Group managers ---

        addGroupManager: build.mutation<AppGroup, {groupId: number, managerEmail: string}>({
            query: ({groupId, managerEmail}) => ({
                method: "POST",
                url: `/groups/${groupId}/manager`,
                body: {email: managerEmail}
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (_, groupWithNewManager, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(groupsApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupWithNewManager.id
                                    ? {...g, additionalManagers: groupWithNewManager.additionalManagers}
                                    : g
                                )
                        ));
                    });
                },
                errorTitle: () => i18next.t("common:groups.managers.add.errorTitle")
            }),
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.appGroup)
        }),

        deleteGroupManager: build.mutation<void, {groupId: number, managerUserId: number}>({
            query: ({groupId, managerUserId}) => ({
                method: "DELETE",
                url: `/groups/${groupId}/manager/${managerUserId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({groupId, managerUserId}, _, {dispatch, getState}) => {
                    const removedSelfAsManager = getState().user.id === managerUserId;
                    [true, false].forEach(archivedGroupsOnly => {
                        if (removedSelfAsManager) {
                            dispatch(groupsApi.util.updateQueryData(
                                "getGroups",
                                archivedGroupsOnly,
                                (groups) =>
                                    groups.filter(g => g.id !== groupId)
                            ));
                            dispatch(assignmentsApi.util.invalidateTags([{type: "GroupAssignments", id: groupId}]));
                            dispatch(assignmentsApi.util.updateQueryData(
                                "getMySetAssignments",
                                undefined,
                                (assignments) => assignments.filter(a => a.groupId !== groupId)
                            ));
                        } else {
                            dispatch(groupsApi.util.updateQueryData(
                                "getGroups",
                                archivedGroupsOnly,
                                (groups) =>
                                    groups.map(g => g.id === groupId
                                        ? {...g, additionalManagers: g.additionalManagers?.filter(m => m.id !== managerUserId)}
                                        : g
                                    )
                            ));
                        }
                    });
                },
                errorTitle: () => i18next.t("common:groups.managers.removeManager.errorTitle")
            }),
        }),

        promoteGroupManager: build.mutation<void, {groupId: number, managerUserId: number}>({
            query: ({groupId, managerUserId}) => ({
                url: `/groups/${groupId}/manager/promote/${managerUserId}`,
                method: "POST"
            }),
            invalidatesTags: ["AllSetTests", "AllSetAssignments", "GroupAssignments", "GroupTests", "Groups"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: () => i18next.t("common:groups.managers.promote.successTitle"),
                successMessage: () => i18next.t("common:groups.managers.promote.successMessage"),
                errorTitle: () => i18next.t("common:groups.managers.promote.errorTitle")
            })
        }),

        // --- Tokens ---

        getGroupToken: build.query<AppGroupTokenDTO, number>({
            query: (groupId) => ({
                url: `/authorisations/token/${groupId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (groupId, tokenDTO, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(groupsApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupId
                                    ? {...g, token: tokenDTO.token}
                                    : g
                                )
                        ));
                    });
                },
                errorTitle: () => i18next.t("common:groups.token.fetch.errorTitle")
            }),
        }),
    })
});

export const {
    useGetGroupsQuery,
    useLazyGetGroupsQuery,
    useGetGroupTokenQuery,
    useGetGroupMembersQuery,
    useLazyGetGroupMembersQuery,
    useGetGroupMembershipsQuery,
    useChangeMyMembershipStatusMutation,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useDeleteGroupMemberMutation,
    useAddGroupManagerMutation,
    useDeleteGroupManagerMutation,
    usePromoteGroupManagerMutation,
} = groupsApi;
