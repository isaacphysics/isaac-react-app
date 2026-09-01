import { IsaacBookDetailPageDTO, IsaacBookIndexPageDTO } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

const booksApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getBookIndexPage: build.query<IsaacBookIndexPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/books/index/${encodeURIComponent(id)}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to fetch book contents."
            }),
            keepUnusedDataFor: 60
        }),

        getBookDetailPage: build.query<IsaacBookDetailPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/books/page/${encodeURIComponent(id)}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to fetch book page."
            }),
            keepUnusedDataFor: 60,
            providesTags: ["AllGameboards"], // required to refetch decks inside the detail page if saved status is updated 
        })

    })
});

export const { 
    useGetBookIndexPageQuery, 
    useGetBookDetailPageQuery, 
} = booksApi;
