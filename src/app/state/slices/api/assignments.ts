import {isaacApi, selectors, useAppSelector} from "../../index";
import {isFound, SortOrder} from "../../../services";
import {
    AppQuizAssignment,
    AssignmentOrderSpec,
    AssignmentOrderType,
    EnhancedAssignment
} from "../../../../IsaacAppTypes";
import {useCallback} from "react";
import {GameboardDTO, IsaacQuizDTO} from "../../../../IsaacApiTypes";
import sortBy from "lodash/sortBy";

// Returns summary assignment objects without data on gameboard contents - much faster to request these from the API
// than those returned from useGroupAssignments
export const useGroupAssignmentSummary = (groupId?: number) => {
    const { data: assignments } = isaacApi.endpoints.getMySetAssignments.useQuery(undefined);
    const quizAssignments = useAppSelector(selectors.quizzes.assignments);

    const groupBoardAssignments = assignments?.filter(a => a.groupId === groupId);
    const groupQuizAssignments = isFound(quizAssignments)
        ? quizAssignments?.filter(a => a.groupId === groupId)
        : undefined;

    const assignmentCount = (groupBoardAssignments?.length ?? 0) + (groupQuizAssignments?.length ?? 0);

    return {
        assignmentCount,
        groupBoardAssignments,
        groupQuizAssignments
    };
};

// Returns assignment objects with full gameboard and question part data
export const useGroupAssignments = (groupId?: number, sortOrder?: AssignmentOrderSpec) => {
    const { data: assignments } = isaacApi.endpoints.getMySetAssignments.useQuery(groupId);
    const quizAssignments = useAppSelector(selectors.quizzes.assignments);

    // This looks a bit odd, but it means that we can use the same sort function for both gameboard and quiz assignments
    type SortFuncInputType = {creationDate?: Date, dueDate?: Date, scheduledStartDate?: Date, gameboard?: GameboardDTO, quiz?: IsaacQuizDTO};
    const sortFunction = useCallback((as: SortFuncInputType[] | undefined) => {
        let sortedAs;
        switch (sortOrder?.type) {
            case AssignmentOrderType.DueDate:
                sortedAs = sortBy(as, a => a.dueDate?.valueOf() ?? a.creationDate?.valueOf() ?? 0);
                break;
            case AssignmentOrderType.StartDate:
                sortedAs = sortBy(as, a => a.scheduledStartDate?.valueOf() ?? a.creationDate?.valueOf() ?? 0);
                break;
            case AssignmentOrderType.Title:
                sortedAs = sortBy(as, a => a.gameboard?.title ?? a.quiz?.title ?? "");
                break;
            default:
                sortedAs = as;
        }
        return sortOrder?.order === SortOrder.DESC ? sortedAs?.reverse() : sortedAs;
    }, [sortOrder]);

    const groupBoardAssignments = sortFunction(assignments) as EnhancedAssignment[] | undefined;
    const groupQuizAssignments = isFound(quizAssignments)
        ? sortFunction(quizAssignments?.filter(a => a.groupId === groupId)) as AppQuizAssignment[] | undefined
        : undefined;

    return {
        groupBoardAssignments,
        groupQuizAssignments
    }
};