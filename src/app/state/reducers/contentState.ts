import {ContentDTO} from "../../../IsaacApiTypes";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {NOT_FOUND, tags} from "../../services";
import {isaacApi, routerPageChange} from "../index";
import {createSlice, isAnyOf} from "@reduxjs/toolkit";

type DocState = ContentDTO | NOT_FOUND_TYPE | null;
export const docSlice = createSlice({
    name: "doc",
    initialState: null as DocState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addMatcher(
                isAnyOf(
                    isaacApi.endpoints.getConcept.matchFulfilled,
                    isaacApi.endpoints.getQuestion.matchFulfilled,
                    isaacApi.endpoints.getPage.matchFulfilled,
                    routerPageChange.match
                ),
                () => null
            )
            .addMatcher(
                isAnyOf(
                    isaacApi.endpoints.getConcept.matchFulfilled,
                    isaacApi.endpoints.getQuestion.matchFulfilled,
                    isaacApi.endpoints.getPage.matchFulfilled
                ),
                (_, action) => ({...tags.augmentDocWithSubject(action.payload)})
            )
            .addMatcher(
                isAnyOf(
                    isaacApi.endpoints.getConcept.matchRejected,
                    isaacApi.endpoints.getQuestion.matchRejected,
                    isaacApi.endpoints.getPage.matchRejected
                ),
                () => NOT_FOUND
            )
    }
});
