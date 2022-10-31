import {RegisteredUserDTO, UserSummaryDTO} from "../../IsaacApiTypes";
import {AppGroup} from "../../IsaacAppTypes";

export const isOwnerOrGroupManager = (user: RegisteredUserDTO | UserSummaryDTO, group: AppGroup): boolean => {
    return user.id === group.ownerId || !!group.additionalManagers?.find(u => u.id === user.id);
}
