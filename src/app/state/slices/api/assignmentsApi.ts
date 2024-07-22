import {isaacApi} from "./baseApi";
import {AssignmentDTO, AssignmentProgressDTO, AssignmentStatusDTO, QuizAssignmentDTO} from "../../../../IsaacApiTypes";
import {EnhancedAssignment} from "../../../../IsaacAppTypes";
import {anonymisationFunctions, anonymiseIfNeededWith, onQueryLifecycleEvents} from "./utils";
import {siteSpecific} from "../../../services";

export const assignmentsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        // === Setting Assignments ===

        // Get all assignments for groups managed by this user. If a group is specified, the returned assignments
        // will have gameboard and question information.
        getMySetAssignments: build.query<AssignmentDTO[], number | undefined>({
            query: (groupId) => ({
                url: "/assignments/assign",
                params: groupId ? {group: groupId} : undefined
            }),
            providesTags: (result, _, groupId) => result ? (groupId ? [{type: "GroupAssignments", id: groupId}] : ["AllSetAssignments"]) : []
        }),

        // Get a specific assignment managed by this user. The returned assignment will have gameboard and question
        // information.
        getSingleSetAssignment: build.query<EnhancedAssignment, number>({
            query: (assignmentId) => ({
                url: `/assignments/assign/${assignmentId}`,
            }),
            providesTags: (result, _, assignmentId) => result ? [{type: "SetAssignment", id: assignmentId}] : []
        }),

        // Get all quiz assignments for groups managed by this user.
        getMySetQuizzes: build.query<QuizAssignmentDTO[], number | undefined>({
            query: (groupId) => ({
                url: "/quiz/assigned",
                params: groupId ? {groupId} : undefined
            }),
            providesTags: (result, _, groupId) => result ? (groupId ? [{type: "GroupTests", id: groupId}] : ["AllSetTests"]) : []
        }),

        getAssignmentProgress: build.query<AssignmentProgressDTO[], number>({
            query: (assignmentId) => ({
                url: `/assignments/assign/${assignmentId}/progress`
            }),
            providesTags: ["AssignmentProgress"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading assignment progress failed"
            }),
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.progressState)
        }),

        assignGameboard: build.mutation<AssignmentStatusDTO[], AssignmentDTO[]>({
            query: (assignments) => ({
                url: "/assignments/assign_bulk",
                method: "POST",
                body: assignments
            }),
            invalidatesTags: result => result ? ["AssignmentProgress", "AllMyAssignments"] : []
        }),

        unassignGameboard: build.mutation<void, {boardId: string, groupId: number}>({
            query: ({boardId, groupId}) => ({
                url: `/assignments/assign/${boardId}/${groupId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, error) => !error ? ["AssignmentProgress", "AllMyAssignments"] : [],
            onQueryStarted: onQueryLifecycleEvents({
                onQueryStart: ({boardId, groupId}, {dispatch}) => {
                    // Update getMySetAssignments cache data, removing any assignments with this group and gameboard id
                    const allAssignmentsPromise = dispatch(assignmentsApi.util.updateQueryData(
                        "getMySetAssignments",
                        undefined,
                        (assignments) => {
                            return (assignments ?? []).filter(a => (a.groupId !== groupId) || (a.gameboardId !== boardId));
                        }
                    ));
                    const groupAssignmentsPromise = dispatch(assignmentsApi.util.updateQueryData(
                        "getMySetAssignments",
                        groupId,
                        (assignments) => {
                            return (assignments ?? []).filter(a => a.gameboardId !== boardId);
                        }
                    ));
                    return {resetOptimisticUpdates: () => {
                            // @ts-ignore These ".undo()"s definitely exist: https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#optimistic-updates
                            allAssignmentsPromise.undo(); groupAssignmentsPromise.undo();
                        }};
                },
                successTitle: siteSpecific("Assignment deleted", "Quiz unassigned"),
                successMessage: siteSpecific("This assignment has been unset successfully.", "You have successfully unassigned the quiz"),
                errorTitle: siteSpecific("Assignment deletion failed", "Quiz unassignment failed")
            })
        }),

        // === Assignments set to me ===

        getMyAssignments: build.query<AssignmentDTO[], void>({
            query: () => ({
                url: "/assignments"
            }),
            providesTags: (result) => result ? ["AllMyAssignments"] : []
        }),
    })
});

export const {
    useGetMySetAssignmentsQuery,
    useGetMyAssignmentsQuery,
    useGetAssignmentProgressQuery,
    useUnassignGameboardMutation,
    useGetSingleSetAssignmentQuery
} = assignmentsApi;
