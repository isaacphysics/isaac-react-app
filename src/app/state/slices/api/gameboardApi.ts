import {isaacApi} from "./baseApi";
import {AssignmentBoardOrder, Boards, NumberOfBoards} from "../../../../IsaacAppTypes";
import {GameboardDTO, GameboardListDTO, IsaacWildcard} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {isPhy, QUESTION_CATEGORY, siteSpecific} from "../../../services";
import {logAction} from "../../actions/logging";

export const gameboardApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({

        getGameboards: build.query<Boards, {startIndex: number, limit: NumberOfBoards, sort?: AssignmentBoardOrder}>({
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
                errorTitle: `Loading ${siteSpecific("question decks", "quizzes")} failed`
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
                errorTitle: `Error creating ${siteSpecific("question deck", "quiz")}`
            }),
            invalidatesTags: ["AllGameboards"],
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
                        .join(",");
                }
                return {
                    url: "/gameboards",
                    params
                };
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: `Error creating temporary ${siteSpecific("question deck", "quiz")}`
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
                errorTitle: `Linking the ${siteSpecific("question deck", "quiz")} to your account failed`
            })
        }),

        linkUserToGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `gameboards/user_gameboards/${boardId}`,
                method: "POST"
            }),
            invalidatesTags: ["AllGameboards"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: `Linking the ${siteSpecific("question deck", "quiz")} to your account failed`
            })
        }),

        unlinkUserFromGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `/gameboards/user_gameboards/${boardId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, error, boardId) => !error ? [{type: "Gameboard", id: boardId}] : [],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: `${siteSpecific("Question deck", "Quiz")} deleted`,
                successMessage: `You have successfully unlinked your account from this ${siteSpecific("question deck", "quiz")}.`,
                errorTitle: `${siteSpecific("Question deck", "Quiz")} deletion failed`
            })
        }),
    })
});

export const {
    useGetGameboardsQuery,
    useLazyGetGameboardsQuery,
    useGetGameboardByIdQuery,
    useLazyGetGameboardByIdQuery,
    useGenerateTemporaryGameboardMutation,
    useGetWildcardsQuery,
    useCreateGameboardMutation
} = gameboardApi;
