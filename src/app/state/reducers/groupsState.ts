import {
    UserSummaryDTO,
    UserSummaryWithEmailAddressDTO,
} from "../../../IsaacApiTypes";
import {Action, GroupMembershipDetailDTO} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

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
