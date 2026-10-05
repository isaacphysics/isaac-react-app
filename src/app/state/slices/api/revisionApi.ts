import { IsaacRevisionDetailPageDTO } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";
import i18next from "i18next";

const revisionApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getRevisionPage: build.query<IsaacRevisionDetailPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/revision/detail/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:revision.errorTitle")
            }),
            keepUnusedDataFor: 60
        }),
    })
});

export const { 
    useGetRevisionPageQuery, 
} = revisionApi;
