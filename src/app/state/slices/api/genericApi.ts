import { SeguePageDTO } from "../../../../IsaacApiTypes";
import { tags } from "../../../services";
import { docSlice } from "../doc";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

export const genericApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getGenericPage: build.query<SeguePageDTO, string>({
            query: (id) => ({
                url: `/pages/${id}`
            }),
            transformResponse: (response: SeguePageDTO) => {
                return tags.augmentDocWithSubject(response);
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to load question",
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
