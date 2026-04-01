// TODO: move to slices when API exists

import { useState } from "react";
import { isaacApi } from "../state";
import { ContentSummaryDTO } from "../../IsaacApiTypes";

export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    const bookmarkItem = (url?: string) => {
        if (!url) return;

        if (bookmarks.includes(url)) {
            setBookmarks(bookmarks.filter(b => b !== url));
        } else {
            setBookmarks([...bookmarks, url]);
        }
    };

    const isBookmarked = (url?: string) => {
        if (!url) return false;
        return bookmarks.includes(url);
    };

    return { isBookmarked, bookmarkItem };
};

// TODO 
// - add these endpoints in the backend
// - replace types with more appropriate ones (if necessary)
// - modify /questions endpoint to return a bookmarked field for each question

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
