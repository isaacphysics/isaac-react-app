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

export const groupsApi = assignmentsApi.injectEndpoints({
    endpoints: (build) => ({

        getGroups: build.query<AppGroup[], boolean>({
            query: (archivedGroupsOnly) => ({
                url: `/groups?archived_groups_only=${archivedGroupsOnly}`
            }),
            providesTags: ["Groups"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading groups failed"
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
                errorTitle: "Group creation failed"
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
                errorTitle: "Group deletion failed"
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
                        dispatch(showSuccessToast("Group updated successfully", message));
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
                errorTitle: "Group saving failed"
            })
        }),

        // --- Group members and memberships ---

        getGroupMemberships: build.query<GroupMembershipDetailDTO[], number | undefined>({
            query: (userId) => ({
                url: userId ? `/groups/membership/${userId}` : "/groups/membership"
            }),
            providesTags: (_, __, userId) => userId ? [{type: "GroupMemberships", id: userId}] : ["MyGroupMemberships"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading group memberships failed"
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
                successTitle: "Status Updated",
                successMessage: "You have updated your membership status.",
                errorTitle: "Membership status update failed"
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
                errorTitle: "Loading group members failed"
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
                        dispatch(assignmentsApi.util.invalidateTags(["AllMyAssignments", "MyGroupMemberships"]));
                    }
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(groupsApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.filter(g => g.selfRemoval && g.members?.find(m => m.id === userId)
                                        ? g.id !== groupId 
                                        : true
                                    )
                                    .map(g => g.id === groupId
                                        ? {...g, members: g.members?.filter(m => m.id !== userId)}
                                        : g
                                    )
                        ));
                    });
                },
                successTitle: "Removal successful",
                successMessage: "You have been removed from the group.",
                errorTitle: "Failed to delete",
                errorMessage: "You have not been removed from the group, please try again."
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
                errorTitle: "Group manager addition failed"
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
                errorTitle: "Group manager removal failed"
            }),
        }),

        promoteGroupManager: build.mutation<void, {groupId: number, managerUserId: number}>({
            query: ({groupId, managerUserId}) => ({
                url: `/groups/${groupId}/manager/promote/${managerUserId}`,
                method: "POST"
            }),
            invalidatesTags: ["AllSetTests", "AllSetAssignments", "GroupAssignments", "GroupTests", "Groups"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Group manager promoted to owner",
                successMessage: "You have been demoted to an additional manager of this group",
                errorTitle: "Group manager promotion failed"
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
                errorTitle: "Loading group token failed"
            }),
        }),
    })
});

export const {
    useGetGroupsQuery,
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