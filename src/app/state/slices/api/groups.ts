import {isaacApi} from "./index";
import {useCallback} from "react";

// Fetches membership and joining token for a given group in the RTK Query cache
export const useGroupInfoCallback = () => {
    const [getGroupMembers] = isaacApi.endpoints.getGroupMembers.useMutation();
    const [getGroupToken] = isaacApi.endpoints.getGroupToken.useMutation();
    return useCallback((groupId: number) => {
        getGroupMembers(groupId);
        getGroupToken(groupId);
    }, [getGroupMembers, getGroupMembers]);
};