import {useGetMySetAssignmentsQuery, useGetQuizAssignmentsSetByMeQuery} from "../../index";
import {isFound, isTeacherOrAbove, SortOrder, sortStringsNumerically} from "../../../services";
import {
    AppQuizAssignment,
    AssignmentOrderSpec,
    AssignmentOrderType,
    EnhancedAssignment
} from "../../../../IsaacAppTypes";
import {GameboardDTO, IsaacQuizDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import sortBy from "lodash/sortBy";
import { skipToken } from "@reduxjs/toolkit/dist/query";

// Returns summary assignment objects without data on gameboard contents - much faster to request these from the API
// than those returned from useGroupAssignments
export const useGroupAssignmentSummary = (user: RegisteredUserDTO, groupId?: number) => {
    const {data: assignments} = useGetMySetAssignmentsQuery(undefined);
    // Tutors can't set quizzes, so we skip the query in that case
    const {data: quizAssignments} = useGetQuizAssignmentsSetByMeQuery(isTeacherOrAbove(user) ? undefined : skipToken);

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
const sortAssignments = (assignments: SortFuncInputType[] | undefined, sortOrder?: AssignmentOrderSpec) => {
    let sortedAssignments;
    switch (sortOrder?.type) {
        case AssignmentOrderType.DueDate:
            sortedAssignments = sortBy(assignments, a => a.dueDate?.valueOf() ?? a.creationDate?.valueOf() ?? 0);
            break;
        case AssignmentOrderType.StartDate:
            sortedAssignments = sortBy(assignments, a => a.scheduledStartDate?.valueOf() ?? a.creationDate?.valueOf() ?? 0);
            break;
        case AssignmentOrderType.Title:
            sortedAssignments = [...(assignments ?? [])].sort((a, b) =>
                sortStringsNumerically(a.gameboard?.title ?? a.quiz?.title ?? "", b.gameboard?.title ?? b.quiz?.title ?? "")
            );
            break;
        default:
            sortedAssignments = assignments;
    }
    return sortOrder?.order === SortOrder.DESC ? sortedAssignments?.reverse() : sortedAssignments;
}

// Returns assignment objects with full gameboard and question part data
export const useGroupAssignments = (user: RegisteredUserDTO, groupId?: number, sortOrder?: AssignmentOrderSpec) => {
    const {data: assignments} = useGetMySetAssignmentsQuery(groupId);
    // Tutors can't set quizzes, so we skip the query in that case
    const {data: quizAssignments} = useGetQuizAssignmentsSetByMeQuery(isTeacherOrAbove(user) ? undefined : skipToken);

    const groupBoardAssignments = sortAssignments(assignments, sortOrder) as EnhancedAssignment[] | undefined;
    const groupQuizAssignments = isFound(quizAssignments)
        ? sortAssignments(quizAssignments?.filter(a => a.groupId === groupId), sortOrder) as AppQuizAssignment[] | undefined
        : undefined;

    return {
        groupBoardAssignments,
        groupQuizAssignments
    }
};