import { IsaacBookDetailPageDTO, IsaacBookIndexPageDTO } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";
import i18next from "i18next";

const booksApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getBookIndexPage: build.query<IsaacBookIndexPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/books/index/${encodeURIComponent(id)}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:books.error.fetchContents")
            }),
            keepUnusedDataFor: 60
        }),

        getBookDetailPage: build.query<IsaacBookDetailPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/books/page/${encodeURIComponent(id)}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:books.error.fetchPage")
            }),
            keepUnusedDataFor: 60
        })

    })
});

export const { 
    useGetBookIndexPageQuery, 
    useGetBookDetailPageQuery, 
} = booksApi;
