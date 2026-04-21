import React, { useState } from "react";
import { useGetBookmarksQuery } from "../../state";
import { ListView } from "../elements/list-groups/ListView";
import { PageContainer } from "../elements/layout/PageContainer";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageMetadata } from "../elements/PageMetadata";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { MyBookmarksSidebar } from "../elements/sidebar/MyBookmarksSidebar";
import { BookmarksOrder } from "../../../IsaacAppTypes";
import { PageFragment } from "../elements/PageFragment";

export const MyBookmarks = () => {
    const bookmarksQuery = useGetBookmarksQuery();

    const [searchText, setSearchText] = useState("");
    const [searchSubjects, setSearchSubjects] = useState<string[]>([]);
    const [searchStages, setSearchStages] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<BookmarksOrder>(BookmarksOrder.date);

    return <PageContainer
        pageTitle={<TitleAndBreadcrumb currentPageTitle="My bookmarks" icon={{type: "icon", icon: "icon-book"}} />}
        sidebar={<MyBookmarksSidebar 
            searchText={searchText} 
            setSearchText={setSearchText}
            searchSubjects={searchSubjects}
            setSearchSubjects={setSearchSubjects}
            searchStages={searchStages}
            setSearchStages={setSearchStages}
            bookmarks={bookmarksQuery.data || []} 
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
        />}
    >

        <PageMetadata noTitle showSidebarButton sidebarInTitle>
            <PageFragment fragmentId="help_toptext_bookmarks" />
        </PageMetadata>

        <ShowLoadingQuery
            query={bookmarksQuery} 
            defaultErrorTitle="Could not load your bookmarks. Please try again later."
            thenRender={(bookmarks) => {
                if (bookmarks.length === 0) {
                    return <span>You have no bookmarks yet.</span>;
                }

                const filteredBookmarks = bookmarks.filter(bookmark => {
                    if (!bookmark) return false;
                    const matchesSearchText = bookmark.title?.toLowerCase().includes(searchText.toLowerCase());
                    const matchesSubject = searchSubjects.length === 0 || bookmark.tags?.some(tag => searchSubjects.includes(tag));
                    const matchesStage = searchStages.length === 0 || bookmark.audience?.some(audience => audience.stage?.some(stage => searchStages.includes(stage)));
                    return matchesSearchText && matchesSubject && matchesStage;
                });

                const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
                    if (sortOrder === BookmarksOrder.date) {
                        if (!a.bookmarked || !b.bookmarked) return 0;
                        return new Date(b.bookmarked).getTime() - new Date(a.bookmarked).getTime();
                    } else if (sortOrder === BookmarksOrder["-date"]) {
                        if (!a.bookmarked || !b.bookmarked) return 0;
                        return new Date(a.bookmarked).getTime() - new Date(b.bookmarked).getTime();
                    } else if (sortOrder === BookmarksOrder.title) {
                        return (a.title || "").localeCompare(b.title || "");
                    } else if (sortOrder === BookmarksOrder["-title"]) {
                        return (b.title || "").localeCompare(a.title || "");
                    }
                    return 0;
                });

                return <ListView
                    type="item"
                    items={sortedBookmarks}
                    allowBookmarking
                />;
            }}
        />
    </PageContainer>;
};
