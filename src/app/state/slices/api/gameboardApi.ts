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
        // FIXME: we don't want to deal with null here any more, only existing boards!
        getGameboardById: build.query<GameboardDTO, string | null>({
            query: (boardId) => ({
                url: `/gameboards/${boardId ? encodeURIComponent(boardId) : null}`,
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
                errorTitle: `Error creating ${siteSpecific("deck", "quiz")}`
            }),
            invalidatesTags: ["AllGameboards"],
        }),

        renameAndLinkUserToGameboard: build.mutation<void, {boardId: string, newTitle: string}>({
            query: ({boardId, newTitle}) => ({
                url: `gameboards/${encodeURIComponent(boardId)}`,
                method: "POST",
                params: {title: newTitle},
            }),
            invalidatesTags: (_, _error, {boardId}) => ["AllGameboards", {type: "Gameboard", id: boardId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: `Linking the ${siteSpecific("deck", "quiz")} to your account failed`
            })
        }),

        linkUserToGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `gameboards/user_gameboards/${encodeURIComponent(boardId)}`,
                method: "POST"
            }),
            // TODO requires invalidating AllSetAssignments as the assignment's gameboard can be updated by this and so should not be cached
            invalidatesTags: (_, _error, boardId) => ["AllGameboards", "AllSetAssignments", {type: "Gameboard", id: boardId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: `Linking the ${siteSpecific("deck", "quiz")} to your account failed`
            })
        }),

        unlinkUserFromGameboard: build.mutation<void, string>({
            query: (boardId) => ({
                url: `/gameboards/user_gameboards/${encodeURIComponent(boardId)}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, _error, boardId) => ["AllGameboards", "AllSetAssignments", {type: "Gameboard", id: boardId}],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: `${siteSpecific("Deck", "Quiz")} removed`,
                successMessage: siteSpecific("The deck has been removed from your saved decks.", "You have successfully unlinked your account from this quiz."),
                errorTitle: `${siteSpecific("Deck", "Quiz")} removal failed`
            })
        }),
    })
});

export const {
    useGetGameboardsQuery,
    useLazyGetGameboardsQuery,
    useGetGameboardByIdQuery,
    useLazyGetGameboardByIdQuery,
    useGetWildcardsQuery,
    useCreateGameboardMutation
} = gameboardApi;
