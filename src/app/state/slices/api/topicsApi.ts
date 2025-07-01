import {isaacApi} from "./baseApi";
import {IsaacTopicSummaryPageDTO} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {docSlice} from "../doc";
import {TAG_ID} from "../../../services";
import {topicSlice} from "../../index";

export const topicsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getTopic: build.query<IsaacTopicSummaryPageDTO, TAG_ID | string | null>({
            query: (id) => ({
                url: `/pages/topics/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to load topic",
                onQueryStart: (_args, {dispatch}) => {
                    dispatch(docSlice.actions.resetPage());
                    dispatch(topicSlice.actions.clearCurrentTopic());
                },
                onQuerySuccess: (_args, response, {dispatch}) => {
                    dispatch(docSlice.actions.updatePage({ doc: response }));
                    dispatch(topicSlice.actions.setCurrentTopic(response));
                }
            })
        })
    })
});

export const {
    useGetTopicQuery
} = topicsApi;