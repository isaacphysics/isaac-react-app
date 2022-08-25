import {History} from "history";
import {DOCUMENT_TYPE, isStaff, TAG_ID} from "./";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {PotentialUser} from "../../IsaacAppTypes";
import queryString from "query-string";

export const pushSearchToHistory = function(history: History, searchQuery: string, typesFilter: DOCUMENT_TYPE[]) {
    const previousQuery = queryString.parse(history.location.search);
    const newQueryOptions = {
        query: encodeURI(searchQuery),
        types: typesFilter.map(encodeURI).join(",") || undefined,
    };
    history.push({
        pathname: "/search",
        search: queryString.stringify({...previousQuery, ...newQueryOptions}, {encode: false}),
    });
};

export function calculateConceptTypes(physics: boolean, maths: boolean, chemistry: boolean) {
    const typesArray = [];
    if (physics) {
        typesArray.push(TAG_ID.physics);
    }
    if (maths) {
        typesArray.push(TAG_ID.maths);
    }
    if (chemistry) {
        typesArray.push(TAG_ID.chemistry);
    }
    return typesArray.join(",");
}
export const pushConceptsToHistory = function(history: History, searchText: string, physics: boolean, maths: boolean, chemistry: boolean) {
    history.push({
        pathname: "/concepts",
        search: `?query=${encodeURIComponent(searchText)}&types=${calculateConceptTypes(physics, maths, chemistry)}`,
    });
};

export const searchResultIsPublic = function(content: ContentSummaryDTO, user?: PotentialUser | null) {
    if (content.deprecated) {
        return false;
    } else if (isStaff(user)) {
        return true;
    } else {
        return !content.supersededBy && !content.tags?.includes("nofilter");
    }
};

export function parseLocationSearch(search: string): [Nullable<string>, DOCUMENT_TYPE[]] {
    const searchParsed = queryString.parse(search);

    const parsedQuery = searchParsed.query || "";
    const query = parsedQuery instanceof Array ? parsedQuery[0] : parsedQuery;

    const parsedFilters = searchParsed.types || "";
    const possibleFilters = (Array.isArray(parsedFilters) ? parsedFilters[0] || "" : parsedFilters || "").split(",");
    const filters = possibleFilters.filter(pf => Object.values(DOCUMENT_TYPE).includes(pf as DOCUMENT_TYPE)) as DOCUMENT_TYPE[]

    return [query, filters];
}