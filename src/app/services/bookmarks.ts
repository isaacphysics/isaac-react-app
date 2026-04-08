// TODO: move to slices when API exists

import { useState } from "react";

// TODO 
// - add these endpoints in the backend (see bookmarksApi.ts)
// - replace types with more appropriate ones (if necessary)
// - modify /questions endpoint to return a bookmarked field for each question

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
