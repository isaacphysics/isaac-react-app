import {Action, GroupMembershipDetailDTO} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

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
