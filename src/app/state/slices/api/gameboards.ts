import {getValue, history, isAdminOrEventManager, isDefined, isTeacher, Item, toTuple, TODAY} from "../../../services";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {AssignmentDTO} from "../../../../IsaacApiTypes";
import {
    AppDispatch,
    AppState,
    isaacApi,
    mutationSucceeded,
    showErrorToast,
    showRTKQueryErrorToastIfNeeded,
    showSuccessToast,
    showToast
} from "../../index";
import {PotentialUser} from "../../../../IsaacAppTypes";

export interface AssignmentSpec {
    boardId: string;
    groups: Item<number>[];
    dueDate?: Date;
    scheduledStartDate?: Date;
    notes?: string;
}

export const assignGameboard = createAsyncThunk(
    "gameboards/assignBoard",
    async ({boardId, groups, dueDate, scheduledStartDate: scheduledStartDateOrToday, notes}: AssignmentSpec, {dispatch, rejectWithValue}) => {
        const appDispatch = dispatch as AppDispatch;
        if (groups.length === 0) {
            appDispatch(showErrorToast(
                "Gameboard assignment failed",
                "Error: Please choose one or more groups."
            ));
            return rejectWithValue(null);
        }

        const today = TODAY();
        const scheduledStartDate = scheduledStartDateOrToday === today ? undefined : scheduledStartDateOrToday;

        if (dueDate !== undefined) {
            dueDate?.setUTCHours(0, 0, 0, 0);
            if ((dueDate.valueOf() - today.valueOf()) < 0) {
                appDispatch(showToast({color: "danger", title: `Gameboard assignment${groups.length > 1 ? "(s)" : ""} failed`, body: "Error: Due date cannot be in the past.", timeout: 5000}) );
                return rejectWithValue(null);
            }
        }

        if (scheduledStartDate !== undefined) {
            scheduledStartDate?.setUTCHours(0, 0, 0, 0);
            if ((scheduledStartDate.valueOf() - today.valueOf()) < 0) {
                appDispatch(showToast({color: "danger", title: `Gameboard assignment${groups.length > 1 ? "(s)" : ""} failed`, body: "Error: Scheduled start date cannot be in the past.", timeout: 5000}));
                return rejectWithValue(null);
            }
        }

        if (dueDate !== undefined && scheduledStartDate !== undefined) {
            if ((dueDate.valueOf() - scheduledStartDate.valueOf()) <= 0) {
                appDispatch(showToast({color: "danger", title: `Gameboard assignment${groups.length > 1 ? "(s)" : ""} failed`, body: "Error: Due date must be strictly after scheduled start date.", timeout: 5000}));
                return rejectWithValue(null);
            }
        }

        const groupIds = groups.map(getValue);
        const assignments: AssignmentDTO[] = groupIds.map(id => ({gameboardId: boardId, groupId: id, dueDate, scheduledStartDate, notes}));

        const response = await dispatch(isaacApi.endpoints.assignGameboard.initiate(assignments));
        if (mutationSucceeded(response)) {
            const groupLookUp = new Map(groups.map(toTuple));
            const assigmentStatuses = response.data;
            const newAssignments: AssignmentDTO[] = assigmentStatuses.filter(a => isDefined(a.assignmentId)).map(a => ({
                groupId: a.groupId,
                gameboardId: boardId,
                groupName: groupLookUp.get(a.groupId),
                assignmentId: a.assignmentId as number,
                creationDate: new Date(),
                dueDate,
                scheduledStartDate,
                notes
            }));
            const successfulIds = newAssignments.map(a => a.groupId);
            const failedIds = assigmentStatuses.filter(a => isDefined(a.errorMessage));
            // Handle user feedback depending on whether some groups failed to assign or not
            if (failedIds.length === 0) {
                const successMessage = successfulIds.length > 1 ? "All assignments have been saved successfully." : "This assignment has been saved successfully."
                appDispatch(showSuccessToast(
                    `Assignment${successfulIds.length > 1 ? "s" : ""} saved`,
                    successMessage
                ));
            } else {
                // Show each group assignment error in a separate toast
                failedIds.forEach(({groupId, errorMessage}) => {
                    appDispatch(showErrorToast(
                        `Gameboard assignment to ${groupLookUp.get(groupId) ?? "unknown group"} failed`,
                        errorMessage as string
                    ));
                });
                // Check whether some group assignments succeeded, if so show "partial success" toast
                if (failedIds.length === assigmentStatuses.length) {
                    return rejectWithValue(null);
                } else {
                    const partialSuccessMessage = successfulIds.length > 1 ? "Some assignments were saved successfully." : `Assignment to ${groupLookUp.get(successfulIds[0] as number)} was saved successfully.`
                    appDispatch(showSuccessToast(
                        `Assignment${successfulIds.length > 1 ? "s" : ""} saved`,
                        partialSuccessMessage
                    ));
                }
            }
            appDispatch(isaacApi.util.updateQueryData(
                "getMySetAssignments",
                undefined,
                (assignmentsByMe) => [...assignmentsByMe, ...newAssignments]
            ));
            return newAssignments;
        } else {
            appDispatch(showRTKQueryErrorToastIfNeeded(
            `Gameboard assignment${groups.length > 1 ? "(s)" : ""} failed`,
                response
            ));
            return rejectWithValue(null);
        }
    }
);

export const unlinkUserFromGameboard = createAsyncThunk<string, {boardId?: string, boardTitle?: string}>(
    "gameboards/deleteBoard",
    async ({boardId, boardTitle}: {boardId?: string, boardTitle?: string}, {getState, dispatch, rejectWithValue}) => {
        if (!isDefined(boardId)) {
            // This really shouldn't happen!
            dispatch(showErrorToast(
                "Gameboard deletion failed",
                "Gameboard ID is missing: please contact us about this error."
            ) as any);
            return rejectWithValue(null);
        }
        try {
            const getAssignments = dispatch(isaacApi.endpoints.getMySetAssignments.initiate(undefined));
            const response = await getAssignments;
            getAssignments.unsubscribe();
            if (response.isSuccess) {
                const assignmentsByMe = response.data;
                const reduxState = getState() as AppState;
                // Check if there are any assignments that use this gameboard...
                const hasAssignedGroups = (assignmentsByMe?.filter(a => a.gameboardId === boardId) ?? []).length > 0;
                if (hasAssignedGroups) {
                    if (reduxState && reduxState.user && reduxState.user.loggedIn && isAdminOrEventManager(reduxState.user)) {
                        if (!confirm(`Warning: You currently have groups assigned to ${boardTitle}. If you delete this your groups will still be assigned but you won't be able to unassign them or see the gameboard in your assigned gameboards or 'My gameboards' page.`)) {
                            return rejectWithValue(null);
                        }
                    } else {
                        dispatch(showErrorToast(
                            "Gameboard deletion not allowed",
                            `You have groups assigned to ${boardTitle}. To delete this gameboard, you must unassign all groups.`
                        ) as any);
                        return rejectWithValue(null);
                    }
                }
                const deleteResponse = await dispatch(isaacApi.endpoints.unlinkUserFromGameboard.initiate(boardId));
                return mutationSucceeded(deleteResponse) ? boardId : rejectWithValue(null);
            } else {
                dispatch(showErrorToast(
                    "Gameboard deletion failed",
                    `Could not fetch assignments to determine if the board deletion is safe.`
                ) as any);
                return rejectWithValue(null);
            }
        } catch (e) {
            dispatch(showRTKQueryErrorToastIfNeeded(
                "Gameboard deletion failed",
                e
            ) as any);
            return rejectWithValue(null);
        }
    }
);

interface SaveGameboardParams {
    boardId: string,
    user: PotentialUser,
    boardTitle?: string,
    redirectOnSuccess?: boolean
}

export const saveGameboard = createAsyncThunk(
    "gameboards/saveGameboard",
    async ({boardId, user, boardTitle, redirectOnSuccess}: SaveGameboardParams, {dispatch, rejectWithValue}) => {
        try {
            if (boardTitle) {
                // If the user wants a custom title, we can use the `renameAndSaveGameboard` endpoint. This is a redesign
                //  of the `updateGameboard` endpoint.
                const response = await dispatch(isaacApi.endpoints.renameAndLinkUserToGameboard.initiate({boardId, newTitle: boardTitle}));
                if (!mutationSucceeded(response)) {
                    return rejectWithValue(null);
                }
            } else {
                // If the user doesn't want a custom title, we can use the `linkUserToGameboard` endpoint
                const response = await dispatch(isaacApi.endpoints.linkUserToGameboard.initiate(boardId));
                if (!mutationSucceeded(response)) {
                    return rejectWithValue(null);
                }
            }
            if (redirectOnSuccess) {
                if (isTeacher(user)) {
                    history.push(`/set_assignments#${boardId}`);
                } else {
                    history.push(`/my_gameboards#${boardId}`);
                }
            }
            return {boardId, boardTitle};
        } catch (e) {
            dispatch(showRTKQueryErrorToastIfNeeded("Error saving gameboard", e) as any);
            return rejectWithValue(null);
        }
    }
);