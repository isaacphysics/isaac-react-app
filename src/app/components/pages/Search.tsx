import React, {ChangeEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {Col, Container, Form, Input, Label, Row} from "reactstrap";
import queryString from "query-string";
import {fetchSearch} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {ContentSummaryDTO, ResultsWrapper, Role} from "../../../IsaacApiTypes";
import {History} from "history";
import {LinkToContentSummaryList} from "../elements/ContentSummaryListGroupItem";
import {DOCUMENT_TYPE} from "../../services/constants";

const stateToProps = (state: AppState) => {
    return {
        searchResults: state && state.search && state.search.searchResults || null,
        userRole: state && state.user && state.user.role || null
    };
};
const dispatchToProps = {fetchSearch};


interface SearchPageProps {
    searchResults: ResultsWrapper<ContentSummaryDTO> | null;
    userRole: Role | null;
    queryParams: {query?: string; types?: string};
    history: History;
    location: Location;
    fetchSearch: (query: string, types: string) => void;
}

function calculateTypes(problems: boolean, concepts: boolean) {
    const typesArray = [];
    if (problems) {
        typesArray.push(DOCUMENT_TYPE.QUESTION);
    }
    if (concepts) {
        typesArray.push(DOCUMENT_TYPE.CONCEPT);
    }
    return typesArray.join(",");
}

const SearchPageComponent = (props: SearchPageProps) => {
    const {searchResults, userRole, location, history, fetchSearch} = props;

    const searchParsed = queryString.parse(location.search);

    const queryParsed = searchParsed.query || "";
    const query = queryParsed instanceof Array ? queryParsed[0] : queryParsed;

    const filterParsed = (searchParsed.types || "");
    const filters = (filterParsed instanceof Array ? filterParsed[0] : filterParsed).split(",");

    const problems = filters.includes(DOCUMENT_TYPE.QUESTION);
    const concepts = filters.includes(DOCUMENT_TYPE.CONCEPT);

    let [searchText, setSearchText] = useState(query);
    let [searchFilterProblems, setSearchFilterProblems] = useState(problems);
    let [searchFilterConcepts, setSearchFilterConcepts] = useState(concepts);

    useEffect(
        () => {
            setSearchText(query);
            setSearchFilterProblems(problems);
            setSearchFilterConcepts(concepts);
            fetchSearch(query, calculateTypes(problems, concepts));
        },
        [query, problems, concepts]
    );

    function doSearch(e?: Event) {
        if (e) {
            e.preventDefault();
        }
        if (searchText != query || searchFilterProblems != problems || searchFilterConcepts != concepts) {
            history.push({
                search: `?query=${searchText}&types=${calculateTypes(searchFilterProblems, searchFilterConcepts)}`
            });
        }
    }

    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        timer.current = window.setTimeout(() => {
            doSearch();
        }, 800);
        return () => {
            clearTimeout(timer.current);
        };
    }, [searchText]);

    useEffect(() => {
        doSearch();
    }, [searchFilterProblems, searchFilterConcepts]);

    const isStaffUser = userRole && (userRole == 'ADMIN' || userRole == 'EVENT_MANAGER' || userRole == 'CONTENT_EDITOR' || userRole == 'STAFF');

    const filterResult = function(r: ContentSummaryDTO) {
        const keepElement = (r.id != "_regression_test_" && (!r.tags || r.tags.indexOf("nofilter") < 0 && !r.supersededBy));
        return keepElement || isStaffUser;
    };

    const filteredSearchResults = searchResults && searchResults.results && searchResults.results.filter(filterResult);

    return (
        <Container id="search-page">
            <Row>
                <Col>
                    <h1 className="h-title">Search</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form inline onSubmit={doSearch}>
                        <Label>Search: &nbsp; <Input type="text" value={searchText} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)} /></Label>
                    </Form>
                </Col>
            </Row>
            {query !== "" && <Row>
                <Col className="py-4">
                    <RS.Card>
                        <RS.CardHeader className="search-header">
                            <Col md={5} xs={12}>
                                <h3>
                                    <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results {filteredSearchResults ? <RS.Badge color="primary">{filteredSearchResults.length}</RS.Badge> : <RS.Spinner color="primary" />}
                                </h3>
                            </Col>
                            <Col md={7} xs={12}>
                                <Form inline className="search-filters">
                                    <Label className="d-none d-sm-inline-block">Filter</Label>
                                    <Label><Input type="checkbox" checked={searchFilterProblems} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchFilterProblems(e.target.checked)} />Search problems</Label>
                                    <Label><Input type="checkbox" checked={searchFilterConcepts} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchFilterConcepts(e.target.checked)} />Search concepts</Label>
                                </Form>
                            </Col>
                        </RS.CardHeader>
                        <RS.CardBody>
                            <ShowLoading until={filteredSearchResults}>
                                {filteredSearchResults && filteredSearchResults.length > 0 ?
                                    <LinkToContentSummaryList items={filteredSearchResults}/>
                                    : <em>No results found</em>}
                            </ShowLoading>
                        </RS.CardBody>
                    </RS.Card>
                </Col>
            </Row>}
        </Container>
    );
};

export const Search = withRouter(connect(stateToProps, dispatchToProps)(SearchPageComponent));
