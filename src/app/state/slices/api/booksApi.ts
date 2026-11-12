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
                errorTitle: () => i18next.t("common:books.error.fetchContents")
            }),
            keepUnusedDataFor: 60
        }),

        getBookDetailPage: build.query<IsaacBookDetailPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/books/page/${encodeURIComponent(id)}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:books.error.fetchPage")
            }),
            providesTags: (page) => {
                const mainBoards = page?.gameboards?.map((gb) => ({type: "Gameboard" as const, id: gb.id})) || [];
                const extensionBoards = page?.extensionGameboards?.map((gb) => ({type: "Gameboard" as const, id: gb.id})) || [];
                return [...mainBoards, ...extensionBoards]; // required to refetch decks inside the detail page if saved status is updated 
            }
        })

    })
});

export const { 
    useGetBookIndexPageQuery, 
    useGetBookDetailPageQuery, 
} = booksApi;
