import React, {FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {AppState, fetchSearch, selectors, useAppDispatch, useAppSelector} from "../../state";
import {
    Card,
    CardBody,
    CardHeader,
    Badge,
    Col,
    Form,
    Container,
} from "reactstrap";
import {ShowLoading} from "../handlers/ShowLoading";
import {
    DOCUMENT_TYPE,
    documentDescription,
    isAda,
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
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import classNames from "classnames";
import {SearchPageSearch} from "../elements/SearchInputs";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import { ListView } from "../elements/list-groups/ListView";

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
export const Search = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const dispatch = useAppDispatch();
    const searchResults = useAppSelector((state: AppState) => state?.search?.searchResults || null);
    const user = useAppSelector(selectors.user.orNull);
    const [urlQuery, urlFilters] = parseLocationSearch(location.search);
    const [queryState, setQueryState] = useState(urlQuery);

    let initialFilters = urlFilters;
    if (isAda && urlFilters.length === 0) {
        initialFilters = [DOCUMENT_TYPE.CONCEPT, DOCUMENT_TYPE.TOPIC_SUMMARY, DOCUMENT_TYPE.GENERIC] as SearchableDocumentType[];
    }
    const [filtersState, setFiltersState] = useState<Item<SearchableDocumentType>[]>(initialFilters.map(itemise));

    useEffect(function triggerSearchAndUpdateLocalStateOnUrlChange() {
        dispatch(fetchSearch(urlQuery ?? "", initialFilters.length ? initialFilters.join(",") : undefined));
        setQueryState(urlQuery);
        setFiltersState(initialFilters.map(itemise));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, location.search]);

    function updateSearchUrl(e?: FormEvent<HTMLFormElement>) {
        if (e) {e.preventDefault();}
        pushSearchToHistory(history, queryState || "", filtersState.map(deitemise));
    }

    // Trigger update to search url on query or filter change
    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        if (queryState !== urlQuery) {
            timer.current = window.setTimeout(() => {updateSearchUrl();}, 800);
            return () => {clearTimeout(timer.current);};
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryState]);

    useEffect(() => {
        const filtersStateMatchesQueryParamFilters =
            filtersState.length === initialFilters.length &&
            filtersState.map(deitemise).every(f => initialFilters.includes(f));
        if (!filtersStateMatchesQueryParamFilters) {
            updateSearchUrl();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersState]);

    // Process results and add shortcut responses
    const filteredSearchResults = searchResults?.results && searchResults.results
        .filter(result => searchResultIsPublic(result, user));
    const shortcutResponses = (queryState ? shortcuts(queryState) : []) as ShortcutResponse[];
    const shortcutAndFilteredSearchResults = (shortcutResponses || []).concat(filteredSearchResults || []);
    const gotResults = shortcutAndFilteredSearchResults && shortcutAndFilteredSearchResults.length > 0;

    return (
        <Container id="search-page">
            <TitleAndBreadcrumb currentPageTitle="Search" icon={{type: "icon", icon: "icon-finder"}} />
            <SearchPageSearch className={siteSpecific("", "border-theme")} initialValue={urlQuery ?? ""} />
            <Card className="my-4">
                <CardHeader className="search-header p-3">
                    <Col xs={12}>
                        <h3 className="me-2">
                            Search Results {urlQuery != "" ? shortcutAndFilteredSearchResults ? <Badge color="primary">{shortcutAndFilteredSearchResults.length}</Badge> : <IsaacSpinner /> : null}
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
                {urlQuery != "" && <CardBody className={classNames({"p-0 m-0": isAda && gotResults})}>
                    <ShowLoading until={shortcutAndFilteredSearchResults}>
                        {gotResults
                            ? <ListView type="item" items={shortcutAndFilteredSearchResults} hasCaret={isAda}/>
                            : <em>No results found</em>}
                    </ShowLoading>
                </CardBody>}
            </Card>
        </Container>
    );
});
