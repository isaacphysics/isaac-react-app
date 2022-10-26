import {
    getValue,
    history,
    isAdminOrEventManager,
    isDefined,
    isTeacher,
    Item,
    KEY,
    persistence,
    TODAY,
    toTuple
} from "../../../services";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {AssignmentDTO} from "../../../../IsaacApiTypes";
import {
    AppDispatch,
    AppState,
    isaacApi,
    mutationSucceeded,
    setAssignBoardPath,
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
    async ({boardId, groups, dueDate, scheduledStartDate, notes}: AssignmentSpec, {dispatch, rejectWithValue}) => {
        const appDispatch = dispatch as AppDispatch;
        if (groups.length === 0) {
            appDispatch(showErrorToast(
                "Gameboard assignment failed",
                "Error: Please choose one or more groups."
            ));
            return rejectWithValue(null);
        }

        const today = TODAY();

        // TODO think about whether this can be done in the back-end too?
        if (dueDate !== undefined) {
            dueDate?.setHours(0, 0, 0, 0);
            if ((dueDate.valueOf() - today.valueOf()) < 0) {
                appDispatch(showToast({color: "danger", title: `Gameboard assignment${groups.length > 1 ? "(s)" : ""} failed`, body: "Error: Due date cannot be in the past.", timeout: 5000}));
                return rejectWithValue(null);
            }
        }

        if (scheduledStartDate !== undefined) {
            // Unlike with the due date, we want to preserve the hour assigned at the UI level, unless we want to move that logic here.
            if (scheduledStartDate.valueOf() <= (new Date()).valueOf()) {
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
                id: a.assignmentId as number,
                groupId: a.groupId,
                gameboardId: boardId,
                groupName: groupLookUp.get(a.groupId),
                // FIXME we *really* need to make sure that we only expect objects in Redux to contain timestamps and not
                //  full-blown Date objects, because these are what the API returns, and also serializable.
                //  Will require a medium-sized refactor.
                creationDate: (new Date()).valueOf() as unknown as Date,
                dueDate: dueDate?.valueOf() as unknown as Date | undefined,
                scheduledStartDate: scheduledStartDate?.valueOf() as unknown as Date | undefined,
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
            // Update all relevant cache entries
            appDispatch(isaacApi.util.updateQueryData(
                "getMySetAssignments",
                undefined,
                (assignmentsByMe) => assignmentsByMe.concat(newAssignments)
            ));
            // FIXME if groupId doesn't correspond to a cache entry then the assignment to that group won't get cached below
            //  one fix would be to use "upsertQueryData" (or whatever it gets called) when it's released
            successfulIds.forEach(groupId => {
                appDispatch(isaacApi.util.updateQueryData(
                    "getMySetAssignments",
                    groupId,
                    (assignmentsByMe) => assignmentsByMe.concat(newAssignments.filter(a => a.groupId === groupId))
                ));
            });
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

export const saveGameboard = createAsyncThunk<{boardId: string, boardTitle?: string}, SaveGameboardParams, {state: AppState}>(
    "gameboards/saveGameboard",
    async ({boardId, user, boardTitle, redirectOnSuccess}, {dispatch, rejectWithValue}) => {
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
                    const assignBoardPath = persistence.load(KEY.ASSIGN_BOARD_PATH) ?? "/set_assignments";
                    history.push(`${assignBoardPath}#${boardId}`);
                    setAssignBoardPath("/set_assignments");
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
