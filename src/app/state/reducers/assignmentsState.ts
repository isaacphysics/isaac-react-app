import {AssignmentDTO, UserGameboardProgressSummaryDTO} from "../../../IsaacApiTypes";
import {Action, AppAssignmentProgress} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

type AssignmentsState = AssignmentDTO[] | null;
export const assignments = (assignments: AssignmentsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ASSIGNMENTS_REQUEST:
            return null;
        case ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        default:
            return assignments;
    }
};

export const assignmentsByMe = (assignments: AssignmentsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ASSIGNMENTS_BY_ME_REQUEST:
            return null;
        case ACTION_TYPE.ASSIGNMENTS_BY_ME_RESPONSE_SUCCESS:
            return action.assignments;
        case ACTION_TYPE.BOARDS_UNASSIGN_RESPONSE_SUCCESS:
            return assignments?.filter(a => a.groupId !== action.groupId);
        case ACTION_TYPE.BOARDS_ASSIGN_RESPONSE_SUCCESS:
            return assignments?.concat(action.newAssignments.map(assignmentStatus => ({
                ...action.assignmentStub,
                id: assignmentStatus.assignmentId,
                groupId: assignmentStatus.groupId,
                groupName: assignmentStatus.groupName
            })));
        default:
            return assignments;
    }
};

export type ProgressState = {[assignmentId: number]: AppAssignmentProgress[]} | null;
export const progress = (progress: ProgressState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.PROGRESS_RESPONSE_SUCCESS:
            return {...progress, [action.assignment._id as number]: action.progress};
        default:
            return progress;
    }
};

export type GroupProgressState = {[id: number]: UserGameboardProgressSummaryDTO[] | null} | null ;
export const groupProgress = (groupProgress: GroupProgressState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.GROUP_PROGRESS_RESPONSE_SUCCESS:
            return {...groupProgress, [action.groupId]: action.progress };
        case ACTION_TYPE.GROUP_PROGRESS_RESPONSE_FAILURE:
            return {...groupProgress, [action.groupId]: []}
        default:
            return groupProgress;
    }
}
