import {isaacApi, selectors, useAppSelector} from "../../index";
import {isFound, SortOrder, sortStringsNumerically} from "../../../services";
import {
    AppQuizAssignment,
    AssignmentOrderSpec,
    AssignmentOrderType,
    EnhancedAssignment
} from "../../../../IsaacAppTypes";
import {GameboardDTO, IsaacQuizDTO} from "../../../../IsaacApiTypes";
import sortBy from "lodash/sortBy";
import produce from "immer";

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

// This looks a bit odd, but it means that we can use the same sort function for both gameboard and quiz assignments
type SortFuncInputType = {creationDate?: Date, dueDate?: Date, scheduledStartDate?: Date, gameboard?: GameboardDTO, quiz?: IsaacQuizDTO};
const sortAssignments = (as: SortFuncInputType[] | undefined, sortOrder: AssignmentOrderSpec) => {
    let sortedAs;
    switch (sortOrder?.type) {
        case AssignmentOrderType.DueDate:
            sortedAs = sortBy(as, a => a.dueDate?.valueOf() ?? a.creationDate?.valueOf() ?? 0);
            break;
        case AssignmentOrderType.StartDate:
            sortedAs = sortBy(as, a => a.scheduledStartDate?.valueOf() ?? a.creationDate?.valueOf() ?? 0);
            break;
        case AssignmentOrderType.Title:
            sortedAs = produce<SortFuncInputType[]>(x => x?.sort(
                    (a, b) =>
                        sortStringsNumerically(a.gameboard?.title ?? a.quiz?.title ?? "", b.gameboard?.title ?? b.quiz?.title ?? "")
                ))(as);
            break;
        default:
            sortedAs = as;
    }
    return sortOrder?.order === SortOrder.DESC ? sortedAs?.reverse() : sortedAs;
}

// Returns assignment objects with full gameboard and question part data
export const useGroupAssignments = (groupId?: number, sortOrder?: AssignmentOrderSpec) => {
    const { data: assignments } = isaacApi.endpoints.getMySetAssignments.useQuery(groupId);
    const quizAssignments = useAppSelector(selectors.quizzes.assignments);

    const groupBoardAssignments = sortAssignments(assignments, sortOrder) as EnhancedAssignment[] | undefined;
    const groupQuizAssignments = isFound(quizAssignments)
        ? sortAssignments(quizAssignments?.filter(a => a.groupId === groupId), sortOrder) as AppQuizAssignment[] | undefined
        : undefined;

    return {
        groupBoardAssignments,
        groupQuizAssignments
    }
};