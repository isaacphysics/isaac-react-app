import {History} from "history";
import {DOCUMENT_TYPE, isStaff, SEARCH_CHAR_LENGTH_LIMIT, TAG_ID} from "./";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {PotentialUser} from "../../IsaacAppTypes";
import queryString from "query-string";
import {Immutable} from "immer";
import React, {FormEvent, useEffect, useRef, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {Form, FormGroup} from "reactstrap";

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

export function calculateConceptTypes(physics: boolean, maths: boolean, chemistry: boolean, biology: boolean) {
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
    if (biology) {
        typesArray.push(TAG_ID.biology);
    }
    return typesArray.join(",");
}
export const pushConceptsToHistory = function(history: History, searchText: string, physics: boolean, maths: boolean, chemistry: boolean, biology: boolean) {
    history.push({
        pathname: "/concepts",
        search: `?query=${encodeURIComponent(searchText)}&types=${calculateConceptTypes(physics, maths, chemistry, biology)}`,
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
    const filters = possibleFilters.filter(pf => Object.values(DOCUMENT_TYPE).includes(pf as DOCUMENT_TYPE)) as DOCUMENT_TYPE[]

    return [query, filters];
}

interface SearchInputProps {
    setSearchText: (s: string) => void;
    searchText: string;
    inputProps: {
        innerRef: React.RefObject<HTMLInputElement>;
        "aria-label": "Search";
        type: "search";
        name: "query";
        maxLength: typeof SEARCH_CHAR_LENGTH_LIMIT;
        placeholder: "Search";
    };
}
// HOC pattern for making different flavour search bars
export function withSearch(Component: React.FC<SearchInputProps>) {
    const SearchComponent = ({className, inline, onSearch, initialValue}: {className?: string; inline?: boolean; onSearch?: (searchText: string) => void; initialValue?: string}) => {
        const [searchText, setSearchText] = useState(initialValue ?? "");
        const searchInputRef = useRef<HTMLInputElement>(null);

        const history = useHistory();
        function doSearch(e: FormEvent<HTMLFormElement>) {
            e.preventDefault();
            if (searchText === "") {
                if (searchInputRef.current) searchInputRef.current.focus();
            } else {
                onSearch?.(searchText);
                pushSearchToHistory(history, searchText, []);
            }
        }

        // Clear this search field on location (i.e. search query) change - user should use the main search bar
        const location = useLocation();
        useEffect(() => { if (location.pathname === "/search") { setSearchText(initialValue ?? ""); }}, [location]);

        return <Form inline={inline} onSubmit={doSearch} className={className}>
            <FormGroup className='form-group search--main-group'>
                <Component inputProps={{
                    maxLength: SEARCH_CHAR_LENGTH_LIMIT,
                    type: "search",
                    name: "query",
                    "aria-label": "Search",
                    innerRef: searchInputRef,
                    placeholder: "Search"
                }} setSearchText={setSearchText} searchText={searchText} />
                <input type="hidden" name="types" value="isaacQuestionPage,isaacConceptPage" />
            </FormGroup>
        </Form>;
    };
    SearchComponent.displayName = "SearchComponent";
    return SearchComponent;
}
