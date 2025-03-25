import { IsaacBookIndexPageDTO } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

const booksApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getBookPage: build.query<IsaacBookIndexPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/books/index/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to fetch book contents."
            }),
            keepUnusedDataFor: 60
        }),
    })
});

export const { useGetBookPageQuery } = booksApi;
