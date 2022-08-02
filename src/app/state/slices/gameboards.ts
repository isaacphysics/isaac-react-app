import {createSlice} from "@reduxjs/toolkit";
import {Boards} from "../../../IsaacAppTypes";
import {isaacApi} from "./api";
import {unionWith} from "lodash";

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
