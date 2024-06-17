import React, {FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {AppState, fetchSearch, selectors, useAppDispatch, useAppSelector} from "../../state";
import * as RS from "reactstrap";
import {Col, Container, Row} from "reactstrap";
import {ShowLoading} from "../handlers/ShowLoading";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {
    DOCUMENT_TYPE,
    documentDescription,
    isAda,
    isIntendedAudience,
    isPhy,
    parseLocationSearch,
    pushSearchToHistory,
    searchResultIsPublic,
    selectOnChange,
    shortcuts,
    siteSpecific,
    useUserViewingContext
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShortcutResponse} from "../../../IsaacAppTypes";
import {UserContextPicker} from "../elements/inputs/UserContextPicker";
import {CSSObjectWithLabel, GroupBase, StylesConfig} from "react-select";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import classNames from "classnames";
import {SearchPageSearch} from "../elements/SearchInputs";
import {StyledSelect} from "../elements/inputs/StyledSelect";

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


const selectStyle: StylesConfig<Item<DOCUMENT_TYPE>, true, GroupBase<Item<DOCUMENT_TYPE>>> = {
    multiValue: (styles: CSSObjectWithLabel) => ({
        ...styles,
        backgroundColor: siteSpecific("rgba(254, 161, 0, 0.9)", "rgba(135, 12, 90, 0.9)"),
        color: siteSpecific("black", "white"),

    }),
    multiValueLabel: (styles: CSSObjectWithLabel) => ({...styles, color: siteSpecific("black", "white")}),
};

// Interacting with the page's filters change the query parameters.
// Whenever the query parameters change we send a search request to the API.
export const Search = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const dispatch = useAppDispatch();
    const searchResults = useAppSelector((state: AppState) => state?.search?.searchResults || null);
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();
    const [urlQuery, urlFilters] = parseLocationSearch(location.search);
    const [queryState, setQueryState] = useState(urlQuery);

    let initialFilters = urlFilters;
    if (isAda && urlFilters.length === 0) {
        initialFilters = [DOCUMENT_TYPE.CONCEPT, DOCUMENT_TYPE.TOPIC_SUMMARY, DOCUMENT_TYPE.GENERIC];
    }
    const [filtersState, setFiltersState] = useState<Item<DOCUMENT_TYPE>[]>(initialFilters.map(itemise));

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
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Search" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <SearchPageSearch className={siteSpecific("", "border-secondary")} initialValue={urlQuery ?? ""} />
                </Col>
            </Row>
            <Row>
                <Col className="py-4">
                    <RS.Card>
                        <RS.CardHeader className="search-header">
                            <RS.Col sm={12} md={5} lg={siteSpecific(5, 4)} xl={siteSpecific(5, 3)}>
                                <h3>
                                    <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results {urlQuery != "" ? shortcutAndFilteredSearchResults ? <RS.Badge color="primary">{shortcutAndFilteredSearchResults.length}</RS.Badge> : <IsaacSpinner /> : null}
                                </h3>
                            </RS.Col>
                            <RS.Col sm={12} md={7} lg={siteSpecific(7, 8)} xl={siteSpecific(7, 9)}>
                                <RS.Form inline className="search-filters">
                                    <RS.Row className="w-100 align-items-center justify-content-end m-0">
                                        <RS.Label htmlFor="document-filter" className="d-none d-lg-inline-block mr-1">
                                            {`Filter${siteSpecific("","s")}:`}
                                        </RS.Label>
                                        <div className="search-filters-select-container">
                                            <StyledSelect
                                                inputId="document-filter" isMulti
                                                placeholder="No page type filter"
                                                value={filtersState}
                                                options={
                                                    [DOCUMENT_TYPE.CONCEPT, DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.GENERIC]
                                                        .concat(siteSpecific([DOCUMENT_TYPE.EVENT], [DOCUMENT_TYPE.TOPIC_SUMMARY]))
                                                        .map(itemise)
                                                }
                                                className="basic-multi-select w-100 w-md-75 w-lg-50 mb-2 mb-md-0"
                                                classNamePrefix="select"
                                                onChange={selectOnChange(setFiltersState, false)}
                                                styles={selectStyle}
                                            />
                                        </div>

                                    </RS.Row>

                                    <UserContextPicker />
                                </RS.Form>
                            </RS.Col>
                        </RS.CardHeader>
                        {urlQuery != "" && <RS.CardBody className={classNames({"p-0 m-0": isAda && gotResults})}>
                            <ShowLoading until={shortcutAndFilteredSearchResults}>
                                {gotResults ?
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
