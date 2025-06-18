import {IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {createSlice} from "@reduxjs/toolkit";
import {NOT_FOUND} from "../../services";

interface actionType {
    payload: TopicState,
    type: string
}

export type TopicState = IsaacTopicSummaryPageDTO | NOT_FOUND_TYPE | null;

export const topicSlice = createSlice({
    name: 'topicSlice',
    initialState: null as TopicState,
    reducers: {
        setCurrentTopic: (_state, action: actionType) => {
            return action.payload;
        },
        clearCurrentTopic: _state => {
            return NOT_FOUND;
        }
    }
});