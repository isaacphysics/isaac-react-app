// TODO: move to slices when API exists

import { useBookmarkItemMutation, useDeleteBookmarkMutation, useGetBookmarksQuery } from "../state";

// TODO 
// - add these endpoints in the backend (see bookmarksApi.ts)
// - replace types with more appropriate ones (if necessary)
// - modify /questions endpoint to return a bookmarked field for each question

export const useBookmarks = () => {
    const [bookmarkItemMutation] = useBookmarkItemMutation();
    const [deleteBookmarkMutation] = useDeleteBookmarkMutation();

    const {data: bookmarks = []} = useGetBookmarksQuery();

    const bookmarkIds = bookmarks.flatMap((bookmark) => bookmark.id ?? []);

    const bookmarkItem = (content_id?: string) => {
        if (!content_id) return;

        if (!bookmarkIds.includes(content_id)) {
            void bookmarkItemMutation({content_id: content_id});
        } else {
            void deleteBookmarkMutation({content_id: content_id});
        }
    };

    const isBookmarked = (content_id?: string) => {
        if (!content_id) return false;
        return bookmarkIds.includes(content_id);
    };

    return { isBookmarked, bookmarkItem };
};
