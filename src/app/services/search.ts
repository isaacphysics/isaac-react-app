import {DOCUMENT_TYPE, isDefined, isStaff, PHY_NAV_SUBJECTS, SEARCH_RESULT_TYPE, SearchableDocumentType, Subject, TAG_ID} from ".";
import {ContentSummaryDTO, Stage} from "../../IsaacApiTypes";
import {PotentialUser} from "../../IsaacAppTypes";
import queryString from "query-string";
import {Immutable} from "immer";
import pickBy from "lodash/pickBy";
import { NavigateFunction } from "react-router-dom";

export const pushSearchToHistory = function(navigate: NavigateFunction, searchQuery: string, typesFilter: SearchableDocumentType[]) {
    const previousQuery = queryString.parse(location.search);
    const newQueryOptions = {
        query: encodeURI(searchQuery),
        types: typesFilter.map(encodeURI).join(",") || undefined,
    };
    void navigate({
        pathname: "/search",
        search: queryString.stringify({...previousQuery, ...newQueryOptions}, {encode: false}),
    });
};

export const pushConceptsToHistory = function(navigate: NavigateFunction, searchText: string, subjects: TAG_ID[], stages: Stage[]) {
    const queryOptions = {
        "query": encodeURIComponent(searchText),
        "types": subjects.join(","),
        "stages": stages.join(","),
    };

    void navigate({ // concepts (phy-only) has no "apply filters" button to imply a single search; as such we prefer replace
        pathname: location.pathname,
        search: queryString.stringify(pickBy(queryOptions), {encode: false}),
    }, { replace: true });
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

export function parseLocationSearch(search: string): [Nullable<string>, SearchableDocumentType[]] {
    const searchParsed = queryString.parse(search);

    const parsedQuery = searchParsed.query || "";
    const query = parsedQuery instanceof Array ? parsedQuery[0] : parsedQuery;

    const parsedFilters = searchParsed.types || "";
    const possibleFilters = (Array.isArray(parsedFilters) ? parsedFilters[0] || "" : parsedFilters || "").split(",");
    const filters = possibleFilters.filter(pf => [...Object.values(DOCUMENT_TYPE), ...Object.values(SEARCH_RESULT_TYPE)].includes(pf as SearchableDocumentType)) as SearchableDocumentType[];

    return [query, filters];
}

const searchPlaceholdersBySubject: {[subject in keyof typeof PHY_NAV_SUBJECTS]: string} = {
    "physics": "Forces",
    "chemistry": "Bond",
    "maths": "Triangle",
    "biology": "Cell"
};

export const getSearchPlaceholder = (subject?: Subject): string => {
    if (!isDefined(subject)) return searchPlaceholdersBySubject["physics"];
    return searchPlaceholdersBySubject[subject];
};
