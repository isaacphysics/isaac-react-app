// TODO: move to slices when API exists

import { useState } from "react";

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

