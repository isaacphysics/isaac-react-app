import { IsaacRevisionDetailPageDTO } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

const revisionApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getRevisionPage: build.query<IsaacRevisionDetailPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/revision/detail/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to fetch revision page."
            }),
            keepUnusedDataFor: 60
        }),
    })
});

export const { 
    useGetRevisionPageQuery, 
} = revisionApi;
