import { ContentSummaryDTO } from "../../../../IsaacApiTypes";
import {isaacApi} from "./baseApi";

// This is in no way fixed! Modify as you will.
export const bookmarksApi = isaacApi.enhanceEndpoints({addTagTypes: ["Bookmarks"]}).injectEndpoints({
    endpoints: (build) => ({
        getBookmarks: build.query<ContentSummaryDTO[], void>({
            query: () => ({
                url: "/bookmarks",
                method: "GET"
            }),
            transformResponse: (response: ContentSummaryDTO[]) => response || [],
            providesTags: ["Bookmarks"],
        }),
        bookmarkItem: build.mutation<void, {content_id: string}>({
            query: ({content_id}) => ({
                url: "/bookmarks",
                method: "POST",
                params: {content_id}
            }),
            invalidatesTags: ["Bookmarks"],
        }),
        deleteBookmark: build.mutation<void, {content_id: string}>({
            query: ({content_id}) => ({
                url: "/bookmarks",
                method: "DELETE",
                params: {content_id}
            }),
            invalidatesTags: ["Bookmarks"],
        }),
    }),
});

export const {
    useGetBookmarksQuery,
    useBookmarkItemMutation,
    useDeleteBookmarkMutation
} = bookmarksApi;
