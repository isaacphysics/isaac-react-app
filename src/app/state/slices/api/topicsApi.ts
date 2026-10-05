import {isaacApi} from "./baseApi";
import {IsaacTopicSummaryPageDTO} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {docSlice} from "../doc";
import {TAG_ID} from "../../../services";
import {topicSlice} from "../../index";
import i18next from "i18next";

export const topicsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getTopic: build.query<IsaacTopicSummaryPageDTO, TAG_ID | string | null>({
            query: (id) => ({
                url: `/pages/topics/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:clientError.topic.loadError"),
            })
        }),

        getTopicWithStateUpdate: build.query<IsaacTopicSummaryPageDTO, TAG_ID | string | null>({
            query: (id) => ({
                url: `/pages/topics/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:clientError.loadTopicFailure"),
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
    useGetTopicQuery,
    useGetTopicWithStateUpdateQuery
} = topicsApi;