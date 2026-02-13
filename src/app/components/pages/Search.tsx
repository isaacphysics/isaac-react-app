import React, {useEffect, useMemo, useState} from "react";
import {selectors, useAppSelector, useSearchRequestQuery} from "../../state";
import {
    Card,
    CardBody,
    CardHeader,
    Badge,
    Col,
    Form,
    Container,
} from "reactstrap";
import {
    DOCUMENT_TYPE,
    documentDescription,
    isAda,
    isDefined,
    parseLocationSearch,
    pushSearchToHistory,
    SEARCH_RESULT_TYPE,
    SearchableDocumentType,
    searchResultIsPublic,
    selectOnChange,
    shortcuts,
    siteSpecific,
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShortcutResponse} from "../../../IsaacAppTypes";
import {UserContextPicker} from "../elements/inputs/UserContextPicker";
import {CSSObjectWithLabel, GroupBase, StylesConfig} from "react-select";
import classNames from "classnames";
import {SearchPageSearch} from "../elements/SearchInputs";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import { ListView } from "../elements/list-groups/ListView";
import { ContentSummaryDTO } from "../../../IsaacApiTypes";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import debounce from "lodash/debounce";
import { skipToken } from "@reduxjs/toolkit/query";
import { useLocation, useNavigate } from "react-router";

interface Item<T> {
    value: T;
    label: string;
}

function itemise(document: SearchableDocumentType): Item<SearchableDocumentType> {
    return {value: document, label: documentDescription[document]};
}
function deitemise(item: Item<SearchableDocumentType>) {
    return item.value;
}


const selectStyle: StylesConfig<Item<SearchableDocumentType>, true, GroupBase<Item<SearchableDocumentType>>> = {
    multiValue: (styles: CSSObjectWithLabel) => ({
        ...styles,
        backgroundColor: siteSpecific("#448525", "rgba(135, 12, 90, 0.9)"),
        color: "white",
    }),
    multiValueLabel: (styles: CSSObjectWithLabel) => ({...styles, color: "white"}),
    menuPortal: base => ({ ...base, zIndex: 19 })
};

// Interacting with the page's filters change the query parameters.
// Whenever the query parameters change we send a search request to the API.
export const Search = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAppSelector(selectors.user.orNull);
    const [urlQuery, urlFilters] = parseLocationSearch(location.search);
    
    let initialFilters = urlFilters;
    if (isAda && urlFilters.length === 0) {
        initialFilters = [DOCUMENT_TYPE.CONCEPT, DOCUMENT_TYPE.TOPIC_SUMMARY, DOCUMENT_TYPE.GENERIC] as SearchableDocumentType[];
    }
    const [filtersState, setFiltersState] = useState<Item<SearchableDocumentType>[]>(initialFilters.map(itemise));
    const [queryState, setQueryState] = useState(urlQuery);

    // searchQuery is really just {queryState, filtersState}, but updating it triggers a request; we wish to debounce this, so the state is kept separate
    const [searchQuery, setSearchQuery] = useState<{query: string; types: string} | typeof skipToken>(skipToken);
    const searchResult = useSearchRequestQuery(searchQuery);

    // Trigger update to query on state change
    const onUpdate = useMemo(() => {
        return debounce((query: Nullable<string>, filters: Item<SearchableDocumentType>[]) => {
            setSearchQuery(query ? {query: decodeURIComponent(query), types: filters.map(deitemise).join(",")} : skipToken);
            pushSearchToHistory(navigate, query || "", filters.map(deitemise));
        }, 500, {leading: true, trailing: true});
    }, [navigate]);

    useEffect(() => {
        onUpdate(queryState, filtersState);
    }, [queryState, filtersState, onUpdate]);

    useEffect(function triggerSearchOnUrlChange() {
        setQueryState(urlQuery);
    }, [urlQuery]);

    // Process results and add shortcut responses

    const shortcutAndFilterResults = (results?: ContentSummaryDTO[]) => {
        const filteredSearchResults = results && results.filter(result => searchResultIsPublic(result, user));
        const shortcutResponses = (queryState ? shortcuts(queryState) : []) as ShortcutResponse[];
        return (shortcutResponses || []).concat(filteredSearchResults || []);
    };

    return (
        <Container id="search-page">
            <TitleAndBreadcrumb currentPageTitle="Search" icon={{type: "icon", icon: "icon-finder"}} />
            <SearchPageSearch className={siteSpecific("", "border-theme")} initialValue={decodeURIComponent(urlQuery ?? "")} onSearch={setQueryState} />
            <Card className="my-4">
                <CardHeader className="search-header p-3">
                    <Col xs={12}>
                        <h3 className="me-2">
                            Search Results {urlQuery != "" && isDefined(searchResult?.currentData?.results) ? <Badge color="primary">{searchResult?.currentData?.results.length}</Badge> : null}
                        </h3>
                    </Col>
                    <Col className="d-flex justify-content-end flex-grow-1">
                        <Form className="form-inline search-filters w-100 gap-2">
                            <div className="align-items-center m-0 d-flex flex-grow-1">
                                <div className={classNames("flex-grow-1 w-100 w-md-75 w-lg-50")}>
                                    <StyledSelect
                                        inputId="document-filter" isMulti
                                        placeholder="Select page type filter..."
                                        value={filtersState}
                                        options={
                                            ([DOCUMENT_TYPE.CONCEPT, DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.GENERIC] as SearchableDocumentType[])
                                                .concat(siteSpecific([DOCUMENT_TYPE.EVENT, DOCUMENT_TYPE.BOOK_INDEX_PAGE, SEARCH_RESULT_TYPE.BOOK_DETAIL_PAGE], [DOCUMENT_TYPE.TOPIC_SUMMARY]))
                                                .map(itemise)
                                        }
                                        onChange={selectOnChange(setFiltersState, false)}
                                        styles={selectStyle}
                                        menuPortalTarget={document.body}
                                    />
                                </div>
                            </div>

                            <UserContextPicker className="searchContextPicker"/>
                        </Form>
                    </Col>
                </CardHeader>
                {urlQuery !== "" && <CardBody className={classNames({"p-0 m-0": isAda})}>
                    <ShowLoadingQuery
                        query={searchResult}
                        defaultErrorTitle="Failed to search. Please try again later."
                        thenRender={({ results }) => {
                            const shortcutAndFilteredSearchResults = shortcutAndFilterResults(results);
                            return shortcutAndFilteredSearchResults.length > 0
                                ? <ListView type="item" items={shortcutAndFilteredSearchResults} hasCaret={isAda}/>
                                : <div className={classNames({"p-4": isAda})}><em>No results found</em></div>;
                        }}
                    />
                </CardBody>}
            </Card>
        </Container>
    );
};
