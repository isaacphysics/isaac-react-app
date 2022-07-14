import React, {ChangeEvent, FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {Col, Container, Form, Input, Row} from "reactstrap";
import queryString from "query-string";
import {fetchSearch} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {DOCUMENT_TYPE, documentDescription, SEARCH_CHAR_LENGTH_LIMIT} from "../../services/constants";
import {pushSearchToHistory, searchResultIsPublic} from "../../services/search";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {shortcuts} from "../../services/searchResults";
import {ShortcutResponse} from "../../../IsaacAppTypes";
import {isIntendedAudience, useUserContext} from "../../services/userContext";
import {UserContextPicker} from "../elements/inputs/UserContextPicker";
import {isCS, isPhy, siteSpecific} from "../../services/siteConstants";
import {selectors} from "../../state/selectors";
import Select, {CSSObjectWithLabel, GroupBase, StylesConfig} from "react-select";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {selectOnChange} from "../../services/select";

interface Item<T> {
    value: T;
    label: string;
}

function itemise(document: DOCUMENT_TYPE): Item<DOCUMENT_TYPE> {
    return {value: document, label: documentDescription[document]};
}
function deitemise(item: Item<DOCUMENT_TYPE>) {
    return item.value;
}

function parseLocationSearch(search: string): [Nullable<string>, DOCUMENT_TYPE[]] {
    const searchParsed = queryString.parse(search);

    const parsedQuery = searchParsed.query || "";
    const query = parsedQuery instanceof Array ? parsedQuery[0] : parsedQuery;

    const parsedFilters = searchParsed.types || "";
    const possibleFilters = (Array.isArray(parsedFilters) ? parsedFilters[0] || "" : parsedFilters || "").split(",");
    const filters = possibleFilters.filter(pf => Object.values(DOCUMENT_TYPE).includes(pf as DOCUMENT_TYPE)) as DOCUMENT_TYPE[]

    return [query, filters];
}

const selectStyle: StylesConfig<Item<DOCUMENT_TYPE>, true, GroupBase<Item<DOCUMENT_TYPE>>> = {
    multiValue: (styles: CSSObjectWithLabel) => ({...styles, backgroundColor: siteSpecific("rgba(254, 161, 0, 0.9)", "rgba(255, 181, 63, 0.9)")}),
    multiValueLabel: (styles: CSSObjectWithLabel) => ({...styles, color: "black"}),
};

// Interacting with the page's filters change the query parameters.
// Whenever the query parameters change we send a search request to the API.
export const Search = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const dispatch = useDispatch();
    const searchResults = useSelector((state: AppState) => state?.search?.searchResults || null);
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();
    const [urlQuery, urlFilters] = parseLocationSearch(location.search);
    const [queryState, setQueryState] = useState(urlQuery);

    let initialFilters = urlFilters;
    if (isCS && urlFilters.length === 0) {
        initialFilters = [DOCUMENT_TYPE.CONCEPT, DOCUMENT_TYPE.EVENT, DOCUMENT_TYPE.TOPIC_SUMMARY, DOCUMENT_TYPE.GENERIC];
    }
    const [filtersState, setFiltersState] = useState<Item<DOCUMENT_TYPE>[]>(initialFilters.map(itemise));

    useEffect(function triggerSearchAndUpdateLocalStateOnUrlChange() {
        dispatch(fetchSearch(urlQuery ?? "", initialFilters.length ? initialFilters.join(",") : undefined));
        setQueryState(urlQuery);
        setFiltersState(initialFilters.map(itemise));
    }, [dispatch, location.search]);

    function updateSearchUrl(e?: FormEvent<HTMLFormElement>) {
        if (e) {e.preventDefault();}
        pushSearchToHistory(history, queryState || "", filtersState.map(deitemise));
    }

    // Trigger update to search url on query or filter change
    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        timer.current = window.setTimeout(() => {updateSearchUrl()}, 800);
        return () => {clearTimeout(timer.current)};
    }, [queryState]);

    useEffect(() => {
        updateSearchUrl()
    }, [filtersState]);

    // Process results and add shortcut responses
    const filteredSearchResults = searchResults?.results && searchResults.results
        .filter(result => searchResultIsPublic(result, user))
        .filter(result => isPhy || isIntendedAudience(result.audience, userContext, user));
    const shortcutResponses = (queryState ? shortcuts(queryState) : []) as ShortcutResponse[];
    const shortcutAndFilteredSearchResults = (shortcutResponses || []).concat(filteredSearchResults || []);

    return (
        <Container id="search-page">
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Search" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form inline onSubmit={updateSearchUrl}>
                        <Input
                            className='search--filter-input mt-4'
                            type="search" value={queryState || ""}
                            placeholder="Search"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setQueryState(e.target.value)}
                            maxLength={SEARCH_CHAR_LENGTH_LIMIT}
                        />
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col className="py-4">
                    <RS.Card>
                        <RS.CardHeader className="search-header">
                            <RS.Col md={5} sm={12}>
                                <h3>
                                    <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results {urlQuery != "" ? shortcutAndFilteredSearchResults ? <RS.Badge color="primary">{shortcutAndFilteredSearchResults.length}</RS.Badge> : <IsaacSpinner /> : null}
                                </h3>
                            </RS.Col>
                            <RS.Col md={7} sm={12}>
                                <RS.Form inline className="search-filters">
                                    <RS.Label htmlFor="document-filter" className="d-none d-lg-inline-block mr-1">
                                        {`Filter${siteSpecific("","s")}:`}
                                    </RS.Label>
                                    <Select
                                        inputId="document-filter" isMulti
                                        placeholder="No page type filter"
                                        defaultValue={filtersState}
                                        options={
                                            [DOCUMENT_TYPE.CONCEPT, DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.EVENT,
                                                DOCUMENT_TYPE.TOPIC_SUMMARY, DOCUMENT_TYPE.GENERIC]
                                                .filter(v => isCS || v !== DOCUMENT_TYPE.TOPIC_SUMMARY)
                                                .map(itemise)
                                        }
                                        className="basic-multi-select w-100 w-md-75 w-lg-50 mb-2 mb-md-0"
                                        classNamePrefix="select"
                                        onChange={selectOnChange(setFiltersState, false)}
                                        styles={selectStyle}
                                    />
                                    {isCS && <RS.Label className="mt-2 mb-2 mb-md-0">
                                        <UserContextPicker className="text-right" />
                                    </RS.Label>}
                                </RS.Form>
                            </RS.Col>
                        </RS.CardHeader>
                        {urlQuery != "" && <RS.CardBody>
                            <ShowLoading until={shortcutAndFilteredSearchResults}>
                                {shortcutAndFilteredSearchResults && shortcutAndFilteredSearchResults.length > 0 ?
                                    <LinkToContentSummaryList items={shortcutAndFilteredSearchResults} displayTopicTitle={true}/>
                                    : <em>No results found</em>}
                            </ShowLoading>
                        </RS.CardBody>}
                    </RS.Card>
                </Col>
            </Row>
        </Container>
    );
});
