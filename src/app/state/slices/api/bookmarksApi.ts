import { ContentSummaryDTO } from "../../../../IsaacApiTypes";
import {isaacApi} from "./baseApi";

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
                url: `/bookmarks/${encodeURIComponent(content_id)}`,
                method: "POST",
            }),
            invalidatesTags: ["Bookmarks"],
        }),
        deleteBookmark: build.mutation<void, {content_id: string}>({
            query: ({content_id}) => ({
                url: `/bookmarks/${encodeURIComponent(content_id)}`,
                method: "DELETE",
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
