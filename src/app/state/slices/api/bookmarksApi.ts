import { ContentSummaryDTO } from "../../../../IsaacApiTypes";
import {isaacApi} from "./baseApi";

// This is in no way fixed! Modify as you will.
export const bookmarksApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getBookmarks: build.query<ContentSummaryDTO[], void>({
            query: () => ({
                url: "/users/current_user/bookmarks",
                method: "GET"
            }),
            transformResponse: (response: ContentSummaryDTO[]) => response || []
        }),
        bookmarkItem: build.mutation<void, {id: string}>({
            query: ({id}) => ({
                url: "/users/current_user/bookmarks",
                method: "POST",
                body: {id}
            }),
        }),
        deleteBookmark: build.mutation<void, {id: string}>({
            query: ({id}) => ({
                url: "/users/current_user/bookmarks",
                method: "DELETE",
                body: {id}
            }),
        }),
    }),
});

export const {
    useGetBookmarksQuery,
    useBookmarkItemMutation,
    useDeleteBookmarkMutation
} = bookmarksApi;
