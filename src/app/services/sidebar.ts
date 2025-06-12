import { SidebarEntryDTO, SidebarGroupDTO } from "../../IsaacApiTypes";
import { BOOK_DETAIL_ID_SEPARATOR, DOCUMENT_TYPE, documentTypePathPrefix } from "./constants";

export const calculateSidebarLink = (entry: SidebarEntryDTO): string | undefined => {
    switch (entry.pageType) {
        case "isaacBookDetailPage": {
            const detailPageSplit = entry.pageId?.split(BOOK_DETAIL_ID_SEPARATOR);
            if (!detailPageSplit || detailPageSplit.length !== 2) {
                return undefined;
            }
            return `/${documentTypePathPrefix[DOCUMENT_TYPE.BOOK_INDEX_PAGE]}/${detailPageSplit[0].slice("book_".length)}/${detailPageSplit[1]}`;
        }
        case "isaacBookIndexPage": {
            return `/${documentTypePathPrefix[DOCUMENT_TYPE.BOOK_INDEX_PAGE]}/${entry.pageId?.slice(`book_`.length)}`;
        }
        case "isaacRevisionDetailPage": {
            return `/${documentTypePathPrefix[DOCUMENT_TYPE.REVISION]}/${entry.pageId}`;
        }
        case "page": {
            return `/${documentTypePathPrefix[DOCUMENT_TYPE.GENERIC]}/${entry.pageId}`;
        }
    }
    return undefined;
};

export const isSidebarGroup = (entry: SidebarEntryDTO): entry is SidebarGroupDTO => {
    return entry.type === "sidebarGroup";
};

export const containsActiveTab = (group: SidebarGroupDTO, currentPathname: string): boolean => {
    return !!group.sidebarEntries?.some(subEntry => {
        if (isSidebarGroup(subEntry)) {
            return containsActiveTab(subEntry, currentPathname);
        }
        return currentPathname === calculateSidebarLink(subEntry);
    });
};
