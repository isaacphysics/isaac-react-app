import {API_PATH, API_REQUEST_FAILURE_MESSAGE, QUESTION_CATEGORY} from "../../../services/constants";
import {BaseQueryFn} from "@reduxjs/toolkit/query";
import {
    FetchArgs,
    FetchBaseQueryArgs,
    FetchBaseQueryError
} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {
    AssignmentDTO,
    AssignmentFeedbackDTO, GameboardDTO,
    GameboardListDTO, IsaacWildcard, QuizAssignmentDTO,
    TOTPSharedSecretDTO,
} from "../../../../IsaacApiTypes";
import {
    logAction,
    showRTKQueryErrorToastIfNeeded,
    showSuccessToast,
} from "../../actions";
import {Dispatch} from "redux";
import {
    AppAssignmentProgress,
    BoardOrder,
    Boards,
    NumberOfBoards,
    EnhancedAssignment
} from "../../../../IsaacAppTypes";
import {isPhy} from "../../../services/siteConstants";
import {errorSlice} from "../internalAppState";
import {SerializedError} from "@reduxjs/toolkit";
import {KEY, load} from "../../../services/localStorage";
import {PromiseWithKnownReason} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import produce from "immer";

// This is used by default as the `baseQuery` of our API slice
const isaacBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const baseQueryArgs: FetchBaseQueryArgs = {
        baseUrl: API_PATH,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            headers.set("accept", "application/json, text/plain, */*");
            return headers;
        }
    }
    const result = await fetchBaseQuery(baseQueryArgs)(args, api, extraOptions);
    if (result.error && result.error.status >= 500 && !(result.error.data as {bypassGenericSiteErrorPage?: boolean})?.bypassGenericSiteErrorPage) {
        if (result.error.status === 502) {
            // A '502 Bad Gateway' response means that the API no longer exists:
            api.dispatch(errorSlice.actions.apiGoneAway);
        } else if (result.error.status === 401) {
            //
        } else {
            api.dispatch(errorSlice.actions.apiServerError);
        }
        // eslint-disable-next-line no-console
        console.warn("Error from API:", result.error);
    } else {
        if (result.meta?.response?.status && result.meta?.response?.status >= 500) {
            // eslint-disable-next-line no-console
            console.warn("Uncaught error from API:", result.meta?.response);
        }
    }
    return result;
}

interface QueryLifecycleSpec<T, R> {
    onQueryStart?: (args: T, dispatch: Dispatch<any>) => void;
    successTitle?: string;
    successMessage?: string;
    onQuerySuccess?: (args: T, response: R, api: {dispatch: Dispatch<any>}) => void;
    errorTitle?: string;
    onQueryError?: (args: T, error: FetchBaseQueryError, api: {dispatch: Dispatch<any>}) => void;
}

const onQueryLifecycleEvents = <T, R>({onQueryStart, successTitle, successMessage, onQuerySuccess, errorTitle, onQueryError}: QueryLifecycleSpec<T, R>) => async (arg: T, { dispatch, queryFulfilled }: { dispatch: Dispatch<any>, queryFulfilled: PromiseWithKnownReason<{data: R, meta: {} | undefined}, any>}) => {
    onQueryStart?.(arg, dispatch);
    try {
        const response = await queryFulfilled;
        if (successTitle && successMessage) {
            dispatch(showSuccessToast(successTitle, successMessage));
        }
        onQuerySuccess?.(arg, response.data, {dispatch});
    } catch (e: any) {
        if (errorTitle) {
            dispatch(showRTKQueryErrorToastIfNeeded(errorTitle, e));
        }
        onQueryError?.(arg, e.error, {dispatch});
    }
};

export const mutationSucceeded = <T>(response: {data: T} | {error: FetchBaseQueryError | SerializedError}): response is {data: T} => {
    return response.hasOwnProperty("data");
}

export const getRTKQueryErrorMessage = (e: FetchBaseQueryError | SerializedError | undefined): {status?: number | string, message: string} => {
    if (e?.hasOwnProperty("data")) {
        // @ts-ignore
        return {status: e.status, message: e?.data?.errorMessage ?? API_REQUEST_FAILURE_MESSAGE}
    }
    if (e?.hasOwnProperty("message")) {
        const se = e as SerializedError;
        return {status: se.code, message: se?.message ?? API_REQUEST_FAILURE_MESSAGE}
    }
    return {message: API_REQUEST_FAILURE_MESSAGE}
}

// The API slice defines reducers and middleware that need adding to \state\reducers\index.ts and \state\store.ts respectively
const isaacApi = createApi({
    tagTypes: ["GlossaryTerms"],
    reducerPath: "isaacApi",
    baseQuery: isaacBaseQuery,
    endpoints: (build) => ({

        // === Gameboards ===
        
        getGameboards: build.query<Boards, {startIndex: number, limit: NumberOfBoards, sort: BoardOrder}>({
            query: ({startIndex, limit, sort}) => ({
                url: "/gameboards/user_gameboards",
                params: {"start_index": startIndex, limit, sort}
            }),
            transformResponse: (response: GameboardListDTO) => ({
                boards: response.results ?? [],
                totalResults: response.totalResults ?? 0
            }),
            //providesTags: results => ({}),
            onQueryStarted: onQueryLifecycleEvents({
               errorTitle: "Loading gameboards failed"
            })
        }),

        // TODO CP need to make this only fetch if we don't already have the board in state (and the board
        //  contains all question data) : this should be easily do-able with tags.
        // TODO CP could actually do ^this^ by inserting each gameboard fetched by `getGameboards` into the cache
        // for this endpoint, which will be easy if RTK Query dev implement the requested `upsertQueryData` util
        // function
        // TODO MT handle local storage load if gameboardId == null
        // TODO MT handle requesting new gameboard if local storage is also null
        getGameboardById: build.query<GameboardDTO, string | null>({
            query: (boardId) => ({
                url: `/gameboards/${boardId}`
            }),
        }),
        
        getWildcards: build.query<IsaacWildcard[], void>({
            query: () => ({
                url: "gameboards/wildcards"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Error loading wildcards"
            })
        }),
        
        createGameboard: build.mutation<GameboardDTO, {gameboard: GameboardDTO, previousId?: string}>({
            query: ({gameboard}) => ({
                url: "gameboards",
                method: "POST",
                body: gameboard,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({gameboard, previousId}, newGameboard, {dispatch}) => {
                    if (previousId) {
                        dispatch(logAction({
                            type: "CLONE_GAMEBOARD",
                            gameboardId: previousId,
                            newGameboardId: newGameboard.id
                        }));
                    }
                },
                errorTitle: "Error creating gameboard"
            })
        }),

        generateTemporaryGameboard: build.mutation<GameboardDTO, {[key: string]: string}>({
            query: (params) => {
                // TODO FILTER: Temporarily force physics to search for problem solving questions
                if (isPhy) {
                    if (!Object.keys(params).includes("questionCategories")) {
                        params.questionCategories = QUESTION_CATEGORY.PROBLEM_SOLVING;
                    }
                    // Swap 'learn_and_practice' to 'problem_solving' and 'books' as that is how the content is tagged
                    // TODO the content should be modified with a script/change of tagging so that this is the case
                    params.questionCategories = params.questionCategories?.split(",")
                        .map(c => c === QUESTION_CATEGORY.LEARN_AND_PRACTICE ? `${QUESTION_CATEGORY.PROBLEM_SOLVING},${QUESTION_CATEGORY.BOOK_QUESTIONS}` : c)
                        .join(",")
                }
                return {
                    url: "/gameboards",
                    params
                }
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Error creating temporary gameboard"
            })
        }),
        
        renameAndLinkUserToGameboard: build.mutation<void, {boardId: string, newTitle: string}>({
            query: ({boardId, newTitle}) => ({
                url: `gameboards/${boardId}`,
                method: "POST",
                params: {title: newTitle},
            })
        }),

        linkUserToGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `gameboards/user_gameboards/${boardId}`,
                method: "POST",
            })
        }),

        unlinkUserFromGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `/gameboards/user_gameboards/${boardId}`,
                method: "DELETE",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Gameboard deleted",
                successMessage: "You have successfully unlinked your account from this gameboard.",
                errorTitle: "Gameboard deletion failed"
            })
        }),

        // === Setting Assignments ===

        // Get all assignments for groups managed by this user. If a group is specified, the returned assignments
        // will have gameboard and question information.
        getMySetAssignments: build.query<AssignmentDTO[], number | undefined>({
            query: (groupId) => ({
                url: "/assignments/assign",
                params: groupId ? {group: groupId} : undefined
            }),
        }),

        // Get a specific assignment managed by this user. The returned assignment will have gameboard and question
        // information.
        getSingleSetAssignment: build.query<EnhancedAssignment, number>({
            query: (assignmentId) => ({
                url: `/assignments/assign/${assignmentId}`,
            }),
        }),

        // Get all quiz assignments for groups managed by this user.
        getMySetQuizzes: build.query<QuizAssignmentDTO[], number | undefined>({
            query: (groupId) => ({
                url: "/quiz/assigned",
                params: groupId ? {groupId} : undefined
            }),
        }),

        getAssignmentProgress: build.query<AppAssignmentProgress[], number>({
            query: (assignmentId) => ({
                url: `/assignments/assign/${assignmentId}/progress`
            }),
            transformResponse: (progress: AppAssignmentProgress[]) =>
                progress && load(KEY.ANONYMISE_USERS) === "YES"
                    ? anonymisationFunctions.progressState(progress)
                    : progress
        }),

        assignGameboard: build.mutation<AssignmentFeedbackDTO[], AssignmentDTO[]>({
            query: (assignments) => ({
                url: "/assignments/assign_bulk",
                method: "POST",
                body: assignments
            }),
        }),

        unassignGameboard: build.mutation<void, {boardId: string, groupId: number}>({
            query: ({boardId, groupId}) => ({
                url: `/assignments/assign/${boardId}/${groupId}`,
                method: "DELETE",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Assignment deleted",
                successMessage: "This assignment has been unset successfully.",
                onQuerySuccess: ({boardId, groupId}, _, {dispatch}) => {
                    // TODO could make these optimistic updates, and revert them on failure? Might require ditching
                    //  onQueryLifecycleEvents for this endpoint
                    dispatch(isaacApi.util.updateQueryData(
                        "getMySetAssignments",
                        undefined,
                        (assignments) => {
                            return (assignments ?? []).filter(a => (a.groupId !== groupId) && (a.gameboardId !== boardId));
                        }
                    ));
                    dispatch(isaacApi.util.updateQueryData(
                        "getMySetAssignments",
                        groupId,
                        (assignments) => {
                            return (assignments ?? []).filter(a => a.gameboardId !== boardId);
                        }
                    ));
                },
                errorTitle: "Assignment deletion failed"
            })
        }),

        // === Assignments set to me ===

        getMyAssignments: build.query<AssignmentDTO[], void>({
            query: () => ({
                url: "/assignments"
            }),
        }),
        
        // === Account MFA ===
        
        setupAccountMFA: build.mutation<void, {sharedSecret: string, mfaVerificationCode: string}>({
            query: ({sharedSecret, mfaVerificationCode}) => ({
                url: "/users/current_user/mfa",
                method: "POST",
                body: {sharedSecret, mfaVerificationCode}
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "2FA Configured",
                successMessage: "You have enabled 2FA on your account!",
                errorTitle: "Failed to setup 2FA on account."
            })
        }),
        
        disableAccountMFA: build.mutation<void, number>({
            query: (userId) => ({
                url: `/users/${userId}/mfa`,
                method: "DELETE"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "2FA Disabled",
                successMessage: "You have disabled 2FA on this account!",
                errorTitle: "Failed to disable 2FA on account."
            })
        }),
        
        newMFASecret: build.mutation<TOTPSharedSecretDTO, void>({
            query: () => ({
                url: "/users/current_user/mfa/new_secret",
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get 2FA secret"
            })
        }),
    })
});

const anonymisationFunctions = {
    progressState: produce<AppAssignmentProgress[]>((progress) => {
        progress.forEach((userProgress, i) => {
            if (userProgress.user) {
                userProgress.user.familyName = "";
                userProgress.user.givenName = `Test Student ${i + 1}`;
            }
        });
    })
}

export {isaacApi};