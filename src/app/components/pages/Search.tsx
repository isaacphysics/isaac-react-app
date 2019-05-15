import React, {ChangeEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Col, Container, Form, FormGroup, Input, Label, Row} from "reactstrap";
import * as RS from "reactstrap";
import queryString from "query-string";
import {fetchSearch} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {ContentSummaryDTO, ResultsWrapper} from "../../../IsaacApiTypes";
import {History, Location} from "history";

const stateToProps = (state: AppState) => {
    return {
        searchResults: state && state.search && state.search.searchResults || null
    };
};
const dispatchToProps = {fetchSearch};

interface SearchPageProps {
    searchResults: ResultsWrapper<ContentSummaryDTO> | null;
    queryParams: {query?: string};
    history: History;
    location: Location;
    fetchSearch: (query: string) => void;
}
const SearchPageComponent = (props: SearchPageProps) => {
    const {searchResults, history, location, fetchSearch} = props;

    const queryParsed = queryString.parse(location.search).query || "";
    const query = queryParsed instanceof Array ? queryParsed[0] : queryParsed;

    let [searchText, setSearchText] = useState(query);

    useEffect(
        () => {
            setSearchText(query);
            fetchSearch(query);
        },
        [query]
    );

    function doSearch(e?: Event) {
        if (e) {
            e.preventDefault();
        }
        history.push({
            //pathname: "/search",
            search: searchText ? `?query=${searchText}` : ''
        });
    }

    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        clearTimeout(timer.current);
        if (searchText != query) {
            timer.current = window.setTimeout(() => {
                doSearch();
            }, 800);
        }
        return () => {
            clearTimeout(timer.current);
        };
    }, [searchText]);

    const isStaffUser = false; // ($scope.user._id && ($scope.user.role == 'ADMIN' || $scope.user.role == 'EVENT_MANAGER' || $scope.user.role == 'CONTENT_EDITOR' || $scope.user.role == 'STAFF'));

    const filterResult = function(r: ContentSummaryDTO) {
        const keepElement = (r.id != "_regression_test_" && (!r.tags || r.tags.indexOf("nofilter") < 0 && !r.supersededBy));
        return keepElement || isStaffUser;
    };

    const filteredSearchResults = searchResults && searchResults.results && searchResults.results.filter(filterResult);

    return (
        <Container>
            <Row>
                <Col>
                    {/* Breadcrumb */}
                    <h1 className="h-title">Search</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form inline onSubmit={doSearch}>
                        <FormGroup>
                            <Label>Search: &nbsp; <Input type="text" value={searchText} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)} />
                            </Label>
                        </FormGroup>
                    </Form>
                </Col>
            </Row>
            {query !== "" && <Row>
                <Col className="py-4 search-panel">
                    <RS.Card>
                        <RS.CardHeader tag="h3">Search Results {filteredSearchResults ? <RS.Badge color="primary">{filteredSearchResults.length}</RS.Badge> : <RS.Spinner color="primary" />}</RS.CardHeader>
                        <RS.CardBody>
                            <ShowLoading until={filteredSearchResults}>
                                {filteredSearchResults && filteredSearchResults.length > 0 ?<RS.ListGroup>
                                    {filteredSearchResults.map(result =>
                                        <RS.ListGroupItem key={result.type + "/" + result.id}><Link
                                            to={"/questions/" + result.id}>{result.title}</Link></RS.ListGroupItem>
                                    )}
                                </RS.ListGroup> : <em>No results found</em>}
                            </ShowLoading>
                        </RS.CardBody>
                    </RS.Card>
                </Col>
            </Row>}
        </Container>
    );
};

export const Search = withRouter(connect(stateToProps, dispatchToProps)(SearchPageComponent));
