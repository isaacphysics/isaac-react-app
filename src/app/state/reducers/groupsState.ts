import {
    UserGroupDTO,
    UserSummaryDTO,
    UserSummaryWithEmailAddressDTO,
    UserSummaryWithGroupMembershipDTO
} from "../../../IsaacApiTypes";
import {Action, AppGroup, AppGroupMembership, GroupMembershipDetailDTO} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {mapValues, union, without} from "lodash";
import {isaacApi} from "../slices/api";

export type ActiveAuthorisationsState = UserSummaryWithEmailAddressDTO[] | null;
export const activeAuthorisations = (activeAuthorisations: ActiveAuthorisationsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.AUTHORISATIONS_ACTIVE_RESPONSE_SUCCESS:
            return [...action.authorisations];
        default:
            return activeAuthorisations;
    }
};

export type OtherUserAuthorisationsState = UserSummaryDTO[] | null;
export const otherUserAuthorisations = (otherUserAuthorisations: OtherUserAuthorisationsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.AUTHORISATIONS_OTHER_USERS_RESPONSE_SUCCESS:
            return [...action.otherUserAuthorisations];
        default:
            return otherUserAuthorisations;
    }
};

const groupMembership = (groupMembership: GroupMembershipDetailDTO, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS:
            return {membershipStatus: action.newStatus, group: groupMembership.group};
        default:
            return groupMembership;
    }
};

export type GroupMembershipsState = GroupMembershipDetailDTO[] | null;
export const groupMemberships = (groupMemberships: GroupMembershipsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.GROUP_GET_MEMBERSHIPS_RESPONSE_SUCCESS:
            return [...action.groupMemberships];
        // delegate to group membership reducer
        case ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS:
            return groupMemberships &&
                groupMemberships.map(m => m.group.id === action.groupId ? groupMembership(m, action) : m);
        default:
            return groupMemberships;
    }
};

function updateGroupsCache(groups: GroupsState | undefined, newGroups: AppGroup[]): GroupsState {
    const cache: {[groupId: number]: AppGroup} = {...(groups && groups.cache)};
    newGroups.forEach(group => {
        if (!group.id) return;
        if (group.id in cache) {
            const existing = cache[group.id];
            cache[group.id] = {
                ...group,
                token: group.token || existing.token,
                members: group.members || existing.members
            };
        } else {
            cache[group.id] = group;
        }
    });
    return {
        ...groups,
        cache
    };
}

function groupsProcessor(groups: GroupsState, updater: (group: AppGroup) => AppGroup) {
    if (groups === null) return groups;
    return {
        ...groups,
        cache: mapValues(groups.cache, (value) => updater(value))
    };
}

function remove(groups: GroupsState, what: AppGroup) {
    const cache: {[groupId: number]: AppGroup}  = {...groups && groups.cache};
    delete cache[what.id as number];
    return {
        ...groups,
        cache: cache,
        active: without(groups && groups.active, what.id as number),
        archived: without(groups && groups.archived, what.id as number)
    };
}

function updateToken(from: GroupsState, group: AppGroup, token: string) {
    return groupsProcessor(from, (g) => {
        if (g && g.id == group.id) {
            return {...g, token: token}
        }
        return g;
    });
}

function updateMembers(from: GroupsState, group: AppGroup, members: UserSummaryWithGroupMembershipDTO[]) {
    return groupsProcessor(from, (g) => {
        if (g && g.id == group.id) {
            return {...g, members: members as AppGroupMembership[]}
        }
        return g;
    });
}

function deleteMember(from: GroupsState, member: AppGroupMembership) {
    return groupsProcessor(from, (g) => {
        if (g && g.id == member.groupMembershipInformation.groupId) {
            return {...g, members: g.members && g.members.filter(m => m.groupMembershipInformation.userId != member.groupMembershipInformation.userId)};
        }
        return g;
    });
}

function addManager(groups: GroupsState, group: AppGroup, newGroup: UserGroupDTO) {
    return groupsProcessor(groups, (g) => {
        if (g && g.id == group.id) {
            return {
                ...g,
                additionalManagers: newGroup.additionalManagers
            };
        }
        return g;
    });
}

function removeManager(groups: GroupsState, group: AppGroup, manager: UserSummaryWithEmailAddressDTO) {
    return groupsProcessor(groups, (g) => {
        if (g && g.id == group.id) {
            return {
                ...g,
                additionalManagers: g.additionalManagers && g.additionalManagers.filter(am => am.id != manager.id)
            };
        }
        return g;
    });
}

function update(groups: GroupsState, what: AppGroup) {
    groups = updateGroupsCache(groups, [what]);
    const active = groups && groups.active || [];
    const archived = groups && groups.archived || [];
    return {
        ...groups,
        active: what.archived ? active : union(active, [what.id as number]),
        archived: what.archived ? union(archived, [what.id as number]) : archived
    };
}

export type GroupsState = {active?: number[]; archived?: number[]; cache?: {[groupId: number]: AppGroup}; selectedGroupId?: number} | null;

export const groups = (groups: GroupsState = null, action: Action): GroupsState => {
    if (isaacApi.endpoints.getGroups.matchFulfilled(action)) {
        groups = updateGroupsCache(groups, action.payload);
        if (action.meta.arg.originalArgs) {
            return {...groups, archived: action.payload.map(g => g.id as number)};
        } else {
            return {...groups, active: action.payload.map(g => g.id as number)};
        }
    }
    switch (action.type) {
        case ACTION_TYPE.GROUPS_SELECT:
            return {...groups, selectedGroupId: action.group && action.group.id || undefined};
        case ACTION_TYPE.GROUPS_CREATE_RESPONSE_SUCCESS:
            return update(groups, action.newGroup);
        case ACTION_TYPE.GROUPS_UPDATE_RESPONSE_SUCCESS:
            return update(groups, action.updatedGroup);
        case ACTION_TYPE.GROUPS_DELETE_RESPONSE_SUCCESS:
            return remove(groups, action.deletedGroup);
        case ACTION_TYPE.GROUPS_TOKEN_RESPONSE_SUCCESS:
            return updateToken(groups, action.group, action.token);
        case ACTION_TYPE.GROUPS_MANAGER_ADD_RESPONSE_SUCCESS:
            return addManager(groups, action.group, action.newGroup);
        case ACTION_TYPE.GROUPS_MANAGER_DELETE_RESPONSE_SUCCESS:
            return removeManager(groups, action.group, action.manager);
        case ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_SUCCESS:
            return updateMembers(groups, action.group, action.members);
        case ACTION_TYPE.GROUPS_MEMBERS_DELETE_RESPONSE_SUCCESS:
            return deleteMember(groups, action.member);
        default:
            return groups;
    }
};
