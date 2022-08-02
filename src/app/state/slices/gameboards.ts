import {createSlice} from "@reduxjs/toolkit";
import {Boards, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {isaacApi} from "./api";
import {GameboardDTO} from "../../../IsaacApiTypes";
import {unionWith} from "lodash";
import {saveGameboard} from "./api/gameboards";
import {NOT_FOUND} from "../../services/constants";
import {routerPageChange} from "../actions";

const mergeBoards = (boards: Boards, additional: Boards): Boards => ({
    totalResults: additional.totalResults || boards.totalResults,
    boards: unionWith(boards.boards, additional.boards, (a, b) => a.id === b.id)
});

export type BoardsState = Boards | null;
export const gameboardsSlice = createSlice({
    name: "gameboards",
    initialState: null as BoardsState,
    reducers: {},
    extraReducers: builder => {
        builder.addMatcher(
            isaacApi.endpoints.getGameboards.matchPending,
            (gameboards, action) => {
                const accumulate = action.meta.arg.originalArgs.startIndex !== 0;
                return accumulate ? gameboards : null;
            }
        ).addMatcher(
            isaacApi.endpoints.getGameboards.matchFulfilled,
            (gameboards, action) => {
                const accumulate = action.meta.arg.originalArgs.startIndex !== 0;
                if (gameboards && accumulate) {
                    return mergeBoards(gameboards, action.payload);
                }
                return action.payload;
            }
        ).addMatcher(
            isaacApi.endpoints.unlinkUserFromGameboard.matchFulfilled,
            (gameboards, action) => {
                if (gameboards) {
                    gameboards.totalResults--;
                    gameboards.boards = gameboards.boards.filter(b => b.id !== action.meta.arg.originalArgs);
                }
            }
        )
    }
});

export type CurrentGameboardState = GameboardDTO | NOT_FOUND_TYPE | null;
export const currentGameboardSlice = createSlice({
    name: "currentGameboard",
    initialState: null as CurrentGameboardState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(
            saveGameboard.fulfilled,
            (currentGameboard, action) => {
                if (currentGameboard && currentGameboard !== NOT_FOUND && currentGameboard.id === action.payload.boardId) {
                    if (action.payload.boardTitle) {
                        currentGameboard.title = action.payload.boardTitle;
                    }
                    currentGameboard.savedToCurrentUser = true;
                }
            }
        ).addCase(
            routerPageChange,
            () => null
        ).addMatcher(
            isaacApi.endpoints.getGameboardById.matchPending,
            (_, action) => null
        ).addMatcher(
            isaacApi.endpoints.getGameboardById.matchFulfilled,
            (_, action) => action.payload
        ).addMatcher(
            isaacApi.endpoints.getGameboardById.matchRejected,
            () => NOT_FOUND
        ).addMatcher(
            isaacApi.endpoints.createGameboard.matchFulfilled,
            (_, action) => ({id: action.payload.id})
        ).addMatcher(
            isaacApi.endpoints.generateTemporaryGameboard.matchFulfilled,
            (_, action) => action.payload
        );
    }
})