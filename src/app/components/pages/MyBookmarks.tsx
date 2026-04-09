import React from "react";
import { useGetBookmarksQuery } from "../../state";
import { ListView } from "../elements/list-groups/ListView";
import { PageContainer } from "../elements/layout/PageContainer";
import { GenericPageSidebar } from "../elements/sidebar/GenericPageSidebar";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageMetadata } from "../elements/PageMetadata";

export const MyBookmarks = () => {
    const {data: bookmarks = []} = useGetBookmarksQuery();

    return <PageContainer
        pageTitle={<TitleAndBreadcrumb currentPageTitle="My bookmarks" icon={{type: "icon", icon: "icon-book"}} />}
        sidebar={<GenericPageSidebar/>}>

        <PageMetadata noTitle showSidebarButton />

        <ListView
            type="item"
            items={bookmarks}
        />
    </PageContainer>;
};