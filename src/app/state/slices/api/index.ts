import {
    API_PATH,
    API_REQUEST_FAILURE_MESSAGE,
    FEATURED_NEWS_TAG,
    isDefined,
    isPhy,
    MEMBERSHIP_STATUS,
    NO_CONTENT,
    NOT_FOUND,
    QUESTION_ATTEMPT_THROTTLED_MESSAGE,
    QUESTION_CATEGORY,
    TAG_ID,
    tags
} from "../../../services";
import {BaseQueryFn} from "@reduxjs/toolkit/query";
import {FetchArgs, FetchBaseQueryArgs, FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {
    AnsweredQuestionsByDate,
    AssignmentDTO,
    AssignmentFeedbackDTO, ChoiceDTO, ContentDTO, ContentSummaryDTO,
    GameboardDTO,
    GameboardListDTO, GraphChoiceDTO,
    IsaacConceptPageDTO,
    IsaacPodDTO, IsaacQuestionPageDTO,
    IsaacTopicSummaryPageDTO,
    IsaacWildcard, QuestionValidationResponseDTO,
    QuizAssignmentDTO, SeguePageDTO, TestCaseDTO,
    TOTPSharedSecretDTO,
    UserSummaryWithGroupMembershipDTO,
} from "../../../../IsaacApiTypes";
import {
    anonymisationFunctions,
    anonymiseIfNeededWith,
    anonymiseListIfNeededWith,
    errorSlice, lockQuestion,
    logAction, showErrorToast,
    showRTKQueryErrorToastIfNeeded,
    showSuccessToast,
    showToast, unlockQuestion
} from "../../index";
import {Dispatch} from "redux";
import {
    AppAssignmentProgress,
    AppGroup,
    AppGroupMembership,
    AppGroupTokenDTO,
    BoardOrder,
    Boards, Choice, Concepts, DocumentSubject,
    EnhancedAssignment,
    GroupMembershipDetailDTO,
    NOT_FOUND_TYPE,
    NumberOfBoards, QuestionSearchQuery, QuestionSearchResponse, UserPreferencesDTO
} from "../../../../IsaacAppTypes";
import {SerializedError} from "@reduxjs/toolkit";
import {PromiseWithKnownReason} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import {Immutable} from "immer";

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
    let result = await fetchBaseQuery(baseQueryArgs)(args, api, extraOptions);
    if (result.error && result.error.status >= 500 && !(result.error.data as {bypassGenericSiteErrorPage?: boolean})?.bypassGenericSiteErrorPage) {
        if (result.error.status === 502) {
            // A '502 Bad Gateway' response means that the API no longer exists:
            api.dispatch(errorSlice.actions.apiGoneAway());
        } else {
            api.dispatch(errorSlice.actions.apiServerError());
        }
        // eslint-disable-next-line no-console
        console.warn("Error from API:", result.error);
    } else {
        const status = result.meta?.response?.status;
        if (!status) return result;
        if (status >= 500) {
            // eslint-disable-next-line no-console
            console.warn("Uncaught error from API:", result.meta?.response);
        } else if ([NOT_FOUND, NO_CONTENT].includes(status)) {
            result.data = NOT_FOUND;
        }
    }
    return result;
}

export const resultOrNotFound = <T>(result: T, error: FetchBaseQueryError | SerializedError | undefined) => {
    return error && 'status' in error && error.status === NOT_FOUND ? NOT_FOUND : result;
}

interface QueryLifecycleSpec<T, R> {
    onQueryStart?: (args: T, api: {dispatch: Dispatch<any>, getState: () => any}) => void | {resetOptimisticUpdates: (() => void)};
    successTitle?: string;
    successMessage?: string;
    onQuerySuccess?: (args: T, response: R, api: {dispatch: Dispatch<any>, getState: () => any}) => void;
    errorTitle?: string;
    onQueryError?: (args: T, error: FetchBaseQueryError, api: {dispatch: Dispatch<any>, getState: () => any}) => void;
}
const onQueryLifecycleEvents = <T, R>({onQueryStart, successTitle, successMessage, onQuerySuccess, errorTitle, onQueryError}: QueryLifecycleSpec<T, R>) => async (arg: T, { dispatch, getState, queryFulfilled }: { dispatch: Dispatch<any>, getState: () => any, queryFulfilled: PromiseWithKnownReason<{data: R, meta: {} | undefined}, any>}) => {
    const queryStartCallbacks = onQueryStart?.(arg, {dispatch, getState});
    try {
        const response = await queryFulfilled;
        if (successTitle && successMessage) {
            dispatch(showSuccessToast(successTitle, successMessage));
        }
        onQuerySuccess?.(arg, response.data, {dispatch, getState});
    } catch (e: any) {
        if (errorTitle) {
            dispatch(showRTKQueryErrorToastIfNeeded(errorTitle, e));
        }
        onQueryError?.(arg, e.error, {dispatch, getState});
        queryStartCallbacks?.resetOptimisticUpdates();
    }
};

export const mutationSucceeded = <T>(response: {data: T} | {error: FetchBaseQueryError | SerializedError}): response is {data: T} => {
    return response.hasOwnProperty("data");
}

export const extractDataFromQueryResponse = <T>(response: { data?: T } | { error: FetchBaseQueryError | SerializedError; }): T | NOT_FOUND_TYPE | undefined => {
    if ('data' in response) {
        return response.data;
    } else if ('error' in response && 'status' in response.error && response.error.status === NOT_FOUND) {
        return NOT_FOUND;
    }
    return undefined;
}

export const getRTKQueryErrorMessage = (e: FetchBaseQueryError | SerializedError | undefined, defaultMessage?: string): {status?: number | string, message: string} => {
    if (e?.hasOwnProperty("data")) {
        // @ts-ignore
        return {status: e.status, message: e?.data?.errorMessage ?? defaultMessage ?? API_REQUEST_FAILURE_MESSAGE}
    }
    if (e?.hasOwnProperty("message")) {
        const se = e as SerializedError;
        return {status: se.code, message: se?.message ?? defaultMessage ?? API_REQUEST_FAILURE_MESSAGE}
    }
    return {message: defaultMessage ?? API_REQUEST_FAILURE_MESSAGE}
}

const API_TAGS = [
    "GlossaryTerms",
    "Gameboard",
    "AllSetTests",
    "GroupTests",
    "AllGameboards",
    "AllMyAssignments",
    "SetAssignment",
    "AllSetAssignments",
    "GroupAssignments",
    "AssignmentProgress",
    "Groups",
    "GroupMemberships",
    "MyGroupMemberships",
    "UserPreferences"
];

// FIXME used for rate limiting question attempts, should be replaced with a response from the server warning that the
//  user is close to the attempt limit
interface Attempt {
    attempts: number;
    timestamp: number;
}
const attempts: {[questionId: string]: Attempt} = {};


// The API slice defines reducers and middleware that need adding to \state\reducers\index.ts and \state\store.ts respectively
const isaacApi = createApi({
    tagTypes: API_TAGS,
    reducerPath: "isaacApi",
    baseQuery: isaacBaseQuery,
    keepUnusedDataFor: 0,
    endpoints: (build) => ({

        // === User ===

        getUserPreferences: build.query<UserPreferencesDTO, void>({
            query: () => ({
                url: "/users/user_preferences"
            }),
            providesTags: ["UserPreferences"]
        }),

        // === Content ===

        getNewsPodList: build.query<IsaacPodDTO[], {subject: string; orderDecending?: boolean}>({
            query: ({subject}) => ({
                url: `/pages/pods/${subject}`
            }),
            transformResponse: (response: {results: IsaacPodDTO[]; totalResults: number}, meta, arg) => {
                // Sort news pods in order of id (asc or desc depending on orderDecending), with ones tagged "featured"
                // placed first
                return response.results.sort((a, b) => {
                    const aIsFeatured = a.tags?.includes(FEATURED_NEWS_TAG);
                    const bIsFeatured = b.tags?.includes(FEATURED_NEWS_TAG);
                    if (aIsFeatured && !bIsFeatured) return -1;
                    if (!aIsFeatured && bIsFeatured) return 1;
                    return a.id && b.id
                        ? a.id.localeCompare(b.id) * (arg.orderDecending ? -1 : 1)
                        : 0;
                });
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to display news"
            }),
            keepUnusedDataFor: 60
        }),

        getPage: build.query<SeguePageDTO & DocumentSubject, string>({
            query: (pageId) => ({
                url: `/pages/${pageId}`
            }),
            // For magic javascript reasons `tags.augmentDocWithSubject` cannot replace the lambda below. It has
            // something to do with `this` being messed with...
            transformResponse: (doc: SeguePageDTO) => tags.augmentDocWithSubject(doc)
        }),

        getPageFragment: build.query<ContentDTO, string>({
            query: (fragmentId) => ({
                url: `/pages/fragments/${fragmentId}`
            }),
            keepUnusedDataFor: 60
        }),

        getTopicSummary: build.query<IsaacTopicSummaryPageDTO, TAG_ID>({
            query: (topicTag) => ({
                url: `/pages/topics/${topicTag}`
            })
        }),

        // --- Questions ---

        getQuestion: build.query<IsaacQuestionPageDTO & DocumentSubject, string>({
            query: (id) => ({
                url: `/pages/questions/${id}`
            }),
            transformResponse: (doc: IsaacQuestionPageDTO) => tags.augmentDocWithSubject(doc)
        }),

        getAnsweredQuestionsByDate: build.query<AnsweredQuestionsByDate, {userId: number | string, fromDate: number, toDate: number, perDay: boolean}>({
            query: ({userId, ...params}) => ({
                url: `/pages/questions/${userId}`,
                params
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get answered question activity data"
            })
        }),

        // This is a mutation, since the component that uses this has to manage the returned question list itself,
        // and there would be duplication of quite a lot of data otherwise.
        searchQuestions: build.mutation<ContentSummaryDTO[], QuestionSearchQuery>({
            query: (query) => ({
                url: `/pages/questions`,
                params: query
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to search for questions"
            }),
            transformResponse: (questions: QuestionSearchResponse) =>
                questions.results.map(q => ({
                    ...q,
                    url: q.url && q.url.replace("/isaac-api/api/pages","")
                }))
        }),

        attemptQuestion: build.mutation<QuestionValidationResponseDTO, {id: string, answer: Immutable<ChoiceDTO>, gameboardId?: string}>({
            query: ({id, answer}) => ({
                method: "POST",
                url: `/questions/${id}/answer`,
                body: answer
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({id, gameboardId}, response, {dispatch, getState}) => {
                    const state = getState();
                    const isAnonymous = !state?.user?.loggedIn;
                    const timePeriod = isAnonymous ? 5 * 60 * 1000 : 15 * 60 * 1000;

                    if (gameboardId) {
                        dispatch(isaacApi.util.invalidateTags([{type: "Gameboard", id: gameboardId}]));
                    }

                    // This mirrors the soft limit checking on the server
                    let lastAttempt = attempts[id];
                    if (lastAttempt && lastAttempt.timestamp + timePeriod > Date.now()) {
                        lastAttempt.attempts++;
                        lastAttempt.timestamp = Date.now();
                    } else {
                        lastAttempt = {
                            attempts: 1,
                            timestamp: Date.now()
                        };
                        attempts[id] = lastAttempt;
                    }
                    const softLimit = isAnonymous ? 3 : 10;
                    if (lastAttempt.attempts >= softLimit && !response.correct) {
                        dispatch(showToast({
                            color: "warning", title: "Approaching attempts limit", timeout: 10000,
                            body: "You have entered several guesses for this question; soon it will be temporarily locked."
                        }));
                    }
                },
                onQueryError: ({id}, error, {dispatch, getState}) => {
                    const state = getState();
                    const isAnonymous = !state?.user?.loggedIn;
                    const timePeriod = isAnonymous ? 5 * 60 * 1000 : 15 * 60 * 1000;
                    if (error.status === 429) {
                        dispatch(lockQuestion({id, time: Date.now() + timePeriod}));
                        dispatch(showErrorToast(
                            "Too many attempts",
                            getRTKQueryErrorMessage(error, QUESTION_ATTEMPT_THROTTLED_MESSAGE).message,
                            10000
                        ));
                        setTimeout( () => {
                            dispatch(unlockQuestion(id));
                        }, timePeriod);
                    } else {
                        dispatch(showErrorToast(
                            "Question attempt failed",
                            "Your answer could not be checked. Please try again."
                        ));
                    }
                }
            })
        }),

        testFreeTextQuestion: build.mutation<TestCaseDTO[], {userDefinedChoices: Choice[], testCases: TestCaseDTO[]}>({
            query: (choicesAndCases) => ({
                method: "POST",
                url: "/questions/test?type=isaacFreeTextQuestion",
                body: choicesAndCases
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to test free text question"
            })
        }),

        generateGraphQuestionSpec: build.mutation<string[], GraphChoiceDTO>({
            query: (graphChoice) => ({
                method: "POST",
                url: "/questions/generateSpecification",
                body: graphChoice
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "There was a problem generating a graph specification"
            }),
            transformResponse: (response: {results: string[], totalResults: number}) => response.results
        }),

        // --- Concepts ---

        listConcepts: build.query<ContentSummaryDTO[], {conceptIds?: string, tagIds?: string} | void>({
            query: (searchParams) => ({
                url: "/pages/concepts",
                params: { limit: 999 , ids: searchParams?.conceptIds, tags: searchParams?.tagIds }
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading Concepts Failed"
            }),
            transformResponse: (response: Concepts) => response.results ?? []
        }),

        getConcept: build.query<IsaacConceptPageDTO & DocumentSubject, string>({
            query: (id) => ({
                url: `/pages/concepts/${id}`
            }),
            transformResponse: (doc: IsaacConceptPageDTO) => tags.augmentDocWithSubject(doc)
        }),

        // === Gameboards ===
        
        getGameboards: build.query<Boards, {startIndex: number, limit: NumberOfBoards, sort: BoardOrder}>({
            query: ({startIndex, limit, sort}) => ({
                url: "/gameboards/user_gameboards",
                params: {"start_index": startIndex, limit, sort}
            }),
            providesTags: (result) => result ? ["AllGameboards", ...result.boards.map(b => ({type: "Gameboard" as const, id: b.id}))] : [],
            transformResponse: (response: GameboardListDTO) => ({
                boards: response.results ?? [],
                totalResults: response.totalResults ?? 0
            }),
            onQueryStarted: onQueryLifecycleEvents({
               errorTitle: "Loading gameboards failed"
            })
        }),

        // TODO CP need to make this only fetch if we don't already have the board in state (and the board
        //  contains all question data) : this should be easily do-able with tags.
        // TODO CP could actually do ^this^ by inserting each gameboard fetched by `getGameboards` into the cache
        //  for this endpoint, which will be easy if RTK Query dev implement the requested `upsertQueryData` util
        //  function
        // TODO MT handle local storage load if gameboardId == null
        // TODO MT handle requesting new gameboard if local storage is also null
        getGameboardById: build.query<GameboardDTO, string | null>({
            query: (boardId) => ({
                url: `/gameboards/${boardId}`
            }),
            providesTags: (result) => result && result.id ? [{type: "Gameboard", id: result.id}] : []
        }),
        
        getWildcards: build.query<IsaacWildcard[], void>({
            query: () => ({
                url: "gameboards/wildcards"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Error loading wildcards"
            }),
            keepUnusedDataFor: 60
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
            }),
            invalidatesTags: ["AllGameboards"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Linking the gameboard to your account failed"
            })
        }),

        linkUserToGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `gameboards/user_gameboards/${boardId}`,
                method: "POST"
            }),
            invalidatesTags: ["AllGameboards"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Linking the gameboard to your account failed"
            })
        }),

        unlinkUserFromGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `/gameboards/user_gameboards/${boardId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, error, boardId) => !error ? [{type: "Gameboard", id: boardId}] : [],
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

        getAssignmentProgress: build.query<AppAssignmentProgress[], number>({
            query: (assignmentId) => ({
                url: `/assignments/assign/${assignmentId}/progress`
            }),
            providesTags: ["AssignmentProgress"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading assignment progress failed"
            }),
            transformResponse: anonymiseIfNeededWith<AppAssignmentProgress[]>(anonymisationFunctions.progressState)
        }),

        assignGameboard: build.mutation<AssignmentFeedbackDTO[], AssignmentDTO[]>({
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
                    const allAssignmentsPromise = dispatch(isaacApi.util.updateQueryData(
                        "getMySetAssignments",
                        undefined,
                        (assignments) => {
                            return (assignments ?? []).filter(a => (a.groupId !== groupId) || (a.gameboardId !== boardId));
                        }
                    ));
                    const groupAssignmentsPromise = dispatch(isaacApi.util.updateQueryData(
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
                successTitle: "Assignment deleted",
                successMessage: "This assignment has been unset successfully.",
                errorTitle: "Assignment deletion failed"
            })
        }),

        // === Assignments set to me ===

        getMyAssignments: build.query<AssignmentDTO[], void>({
            query: () => ({
                url: "/assignments"
            }),
            providesTags: (result) => result ? ["AllMyAssignments"] : []
        }),

        // === Groups ===

        getGroups: build.query<AppGroup[], boolean>({
            query: (archivedGroupsOnly) => ({
                url: `/groups?archived_groups_only=${archivedGroupsOnly}`
            }),
            providesTags: ["Groups"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading groups failed"
            }),
            transformResponse: anonymiseListIfNeededWith<AppGroup>(anonymisationFunctions.appGroup),
            keepUnusedDataFor: 60
        }),

        createGroup: build.mutation<AppGroup, string>({
            query: (groupName) => ({
                method: "POST",
                url: "/groups",
                body: {groupName},
            }),
            invalidatesTags: ["AllSetAssignments", "AllMyAssignments", "AllSetTests", "AssignmentProgress"],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (_, newGroup, {dispatch}) => {
                    // Created groups are active by default, so don't need to update cache for archived groups
                    dispatch(isaacApi.util.updateQueryData(
                        "getGroups",
                        false,
                        (groups) => [...groups, newGroup]
                    ));
                },
                errorTitle: "Group creation failed"
            }),
            transformResponse: anonymiseIfNeededWith<AppGroup>(anonymisationFunctions.appGroup)
        }),

        deleteGroup: build.mutation<void, number>({
            query: (groupId) => ({
                method: "DELETE",
                url: `/groups/${groupId}`,
            }),
            invalidatesTags: (_, error, groupId) => ["AllSetAssignments", "AllMyAssignments", "AllSetTests", "AssignmentProgress", {type: "GroupAssignments", id: groupId}, {type: "GroupTests", id: groupId}],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (groupId, _, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => dispatch(isaacApi.util.updateQueryData(
                        "getGroups",
                        archivedGroupsOnly,
                        (groups) => groups.filter(g => g.id !== groupId)
                    )));
                },
                errorTitle: "Group deletion failed"
            })
        }),

        updateGroup: build.mutation<void, {updatedGroup: AppGroup; message?: string}>({
            query: ({updatedGroup}) => ({
                method: "POST",
                url: `/groups/${updatedGroup.id}`,
                body: {...updatedGroup, members: undefined}
            }),
            invalidatesTags: (_, error, {updatedGroup}) => !isDefined(error) ? [{type: "GroupAssignments", id: updatedGroup.id}] : [],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({updatedGroup, message}, _, {dispatch}) => {
                    dispatch(showSuccessToast("Group saved successfully", message));
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(isaacApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) => {
                                // If updatedGroup should be in this list (archived or active) ...
                                if (updatedGroup.archived === archivedGroupsOnly) {
                                    // ... and actually is ...
                                    if (groups.find(g => g.id === updatedGroup.id)) {
                                        // ... then update the existing entry ...
                                        return groups.map(g => g.id === updatedGroup.id ? updatedGroup : g);
                                    } else {
                                        // ... otherwise, add it to the list.
                                        return groups.concat([updatedGroup]);
                                    }
                                } else {
                                    // If updatedGroup shouldn't be in the list, make sure that it isn't
                                    return groups.filter(g => g.id !== updatedGroup.id);
                                }
                            })
                        );
                    });
                },
                errorTitle: "Group saving failed"
            })
        }),

        // --- Group members and memberships ---

        getGroupMemberships: build.query<GroupMembershipDetailDTO[], number | undefined>({
            query: (userId) => ({
                url: userId ? `/groups/membership/${userId}` : "/groups/membership"
            }),
            providesTags: (_, __, userId) => userId ? [{type: "GroupMemberships", id: userId}] : ["MyGroupMemberships"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading group memberships failed"
            }),
            transformResponse: anonymiseListIfNeededWith<GroupMembershipDetailDTO>(anonymisationFunctions.groupMembershipDetail)
        }),

        changeMyMembershipStatus: build.mutation<void, {groupId: number, newStatus: MEMBERSHIP_STATUS}>({
            query: ({groupId, newStatus}) => ({
                method: "POST",
                url: `/groups/membership/${groupId}/${newStatus}`
            }),
            invalidatesTags: ["MyGroupMemberships"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Status Updated",
                successMessage: "You have updated your membership status.",
                errorTitle: "Membership status update failed"
            }),
        }),

        getGroupMembers: build.query<UserSummaryWithGroupMembershipDTO[], number>({
            query: (groupId) => ({
                url: `/groups/${groupId}/membership`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (groupId, members, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(isaacApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupId
                                    ? {...g, members: members as AppGroupMembership[]}
                                    : g
                                )
                        ));
                    });
                },
                errorTitle: "Loading group members failed"
            }),
            keepUnusedDataFor: 0,
            transformResponse: anonymiseListIfNeededWith<UserSummaryWithGroupMembershipDTO>(anonymisationFunctions.userSummary())
        }),

        deleteGroupMember: build.mutation<void, {groupId: number, userId: number}>({
            query: ({groupId, userId}) => ({
                method: "DELETE",
                url: `/groups/${groupId}/membership/${userId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({groupId, userId}, _, {dispatch, getState}) => {
                    const currentUserId = getState().user.id;
                    if (currentUserId === userId) {
                        dispatch(isaacApi.util.invalidateTags(["AllMyAssignments"]));
                    }
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(isaacApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupId
                                    ? {...g, members: g.members?.filter(m => m.id !== userId)}
                                    : g
                                )
                        ));
                    });
                },
                errorTitle: "Failed to delete member"
            })
        }),

        // --- Group managers ---

        addGroupManager: build.mutation<AppGroup, {groupId: number, managerEmail: string}>({
            query: ({groupId, managerEmail}) => ({
                method: "POST",
                url: `/groups/${groupId}/manager`,
                body: {email: managerEmail}
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (_, groupWithNewManager, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(isaacApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupWithNewManager.id
                                    ? {...g, additionalManagers: groupWithNewManager.additionalManagers}
                                    : g
                                )
                        ));
                    });
                },
                errorTitle: "Group manager addition failed"
            }),
            transformResponse: anonymiseIfNeededWith<AppGroup>(anonymisationFunctions.appGroup)
        }),

        deleteGroupManager: build.mutation<void, {groupId: number, managerUserId: number}>({
            query: ({groupId, managerUserId}) => ({
                method: "DELETE",
                url: `/groups/${groupId}/manager/${managerUserId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: ({groupId, managerUserId}, _, {dispatch, getState}) => {
                    const removedSelfAsManager = getState().user.id === managerUserId;
                    [true, false].forEach(archivedGroupsOnly => {
                        if (removedSelfAsManager) {
                            dispatch(isaacApi.util.updateQueryData(
                                "getGroups",
                                archivedGroupsOnly,
                                (groups) =>
                                    groups.filter(g => g.id !== groupId)
                            ));
                            dispatch(isaacApi.util.invalidateTags([{type: "GroupAssignments", id: groupId}]));
                            dispatch(isaacApi.util.updateQueryData(
                                "getMySetAssignments",
                                undefined,
                                (assignments) => assignments.filter(a => a.groupId !== groupId)
                            ));
                        } else {
                            dispatch(isaacApi.util.updateQueryData(
                                "getGroups",
                                archivedGroupsOnly,
                                (groups) =>
                                    groups.map(g => g.id === groupId
                                        ? {...g, additionalManagers: g.additionalManagers?.filter(m => m.id !== managerUserId)}
                                        : g
                                    )
                            ));
                        }
                    });
                },
                errorTitle: "Group manager removal failed"
            }),
        }),

        // --- Tokens ---

        getGroupToken: build.query<AppGroupTokenDTO, number>({
            query: (groupId) => ({
                url: `/authorisations/token/${groupId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (groupId, tokenDTO, {dispatch}) => {
                    [true, false].forEach(archivedGroupsOnly => {
                        dispatch(isaacApi.util.updateQueryData(
                            "getGroups",
                            archivedGroupsOnly,
                            (groups) =>
                                groups.map(g => g.id === groupId
                                    ? {...g, token: tokenDTO.token}
                                    : g
                                )
                        ));
                    });
                },
                errorTitle: "Loading group token failed"
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

export {isaacApi};