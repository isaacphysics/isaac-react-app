import { isaacApi, useAppSelector, selectors } from "../../index";
import { isFound } from "../../../services";
import { EnhancedAssignment } from "../../../../IsaacAppTypes";

// Returns summary assignment objects without data on gameboard contents - much faster to request these from the API
// than those returned from useGroupAssignments
export const useGroupAssignmentSummary = (groupId?: number) => {
  const { data: assignments } = isaacApi.endpoints.getMySetAssignments.useQuery(undefined);
  const quizAssignments = useAppSelector(selectors.quizzes.assignments);

  const groupBoardAssignments = assignments?.filter((a) => a.groupId === groupId);
  const groupQuizAssignments = isFound(quizAssignments)
    ? quizAssignments?.filter((a) => a.groupId === groupId)
    : undefined;

  const assignmentCount = (groupBoardAssignments?.length ?? 0) + (groupQuizAssignments?.length ?? 0);

  return {
    assignmentCount,
    groupBoardAssignments,
    groupQuizAssignments,
  };
};

// Returns assignment objects with full gameboard and question part data
export const useGroupAssignments = (groupId?: number) => {
  const { data: groupBoardAssignments } = isaacApi.endpoints.getMySetAssignments.useQuery(groupId);
  const quizAssignments = useAppSelector(selectors.quizzes.assignments);
  const groupQuizAssignments = isFound(quizAssignments)
    ? quizAssignments?.filter((a) => a.groupId === groupId)
    : undefined;

  return {
    groupBoardAssignments: groupBoardAssignments as EnhancedAssignment[] | undefined,
    groupQuizAssignments,
  };
};
