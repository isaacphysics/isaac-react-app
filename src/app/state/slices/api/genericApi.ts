import { SeguePageDTO } from "../../../../IsaacApiTypes";
import { docSlice } from "../doc";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";
import i18next from "i18next";

export const genericApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getGenericPage: build.query<SeguePageDTO, string>({
            query: (id) => ({
                url: `/pages/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:questions.load.errorTitle"),
                onQueryStart: (_args, {dispatch}) => {
                    dispatch(docSlice.actions.resetPage());
                },
                onQuerySuccess: (_args, response, {dispatch}) => {
                    dispatch(docSlice.actions.updatePage({ doc: response }));
                }
            }),
            keepUnusedDataFor: 0,
        }),
    })
});

export const {
    useGetGenericPageQuery,
} = genericApi;
