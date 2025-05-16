import {History} from "history";
import {DOCUMENT_TYPE, isStaff, TAG_ID} from ".";
import {ContentSummaryDTO, Stage} from "../../IsaacApiTypes";
import {PotentialUser} from "../../IsaacAppTypes";
import queryString from "query-string";
import {Immutable} from "immer";
import pickBy from "lodash/pickBy";

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

export const pushConceptsToHistory = function(history: History, searchText: string, subjects: TAG_ID[], stages: Stage[]) {
    const queryOptions = {
        "query": encodeURIComponent(searchText),
        "types": subjects.join(","),
        "stages": stages.join(","),
    };
    history.push({
        pathname: history.location.pathname,
        search: queryString.stringify(pickBy(queryOptions), {encode: false}),
    });
};

export const searchResultIsPublic = function(content: ContentSummaryDTO, user?: Immutable<PotentialUser> | null) {
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
    const filters = possibleFilters.filter(pf => Object.values(DOCUMENT_TYPE).includes(pf as DOCUMENT_TYPE)) as DOCUMENT_TYPE[];

    return [query, filters];
}
