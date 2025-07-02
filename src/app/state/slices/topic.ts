import {IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {createSlice} from "@reduxjs/toolkit";
import {NOT_FOUND} from "../../services";

export type CurrentTopicState = IsaacTopicSummaryPageDTO | NOT_FOUND_TYPE | null;

interface actionType {
    payload: CurrentTopicState,
    type: string
}

export const topicSlice = createSlice({
    name: 'topicSlice',
    initialState: null as CurrentTopicState,
    reducers: {
        setCurrentTopic: (_state, action: actionType) => {
            return action.payload;
        },
        clearCurrentTopic: _state => {
            return NOT_FOUND;
        }
    }
});