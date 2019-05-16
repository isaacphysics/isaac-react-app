import React, {ChangeEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Col, Container, Form, FormGroup, Input, Label, Row} from "reactstrap";
import * as RS from "reactstrap";
import queryString from "query-string";
import {fetchSearch} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {ContentSummaryDTO, ResultsWrapper, Role} from "../../../IsaacApiTypes";
import {History} from "history";

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
    queryParams: {query?: string};
    history: History;
    fetchSearch: (query: string) => void;
}
const SearchPageComponent = (props: SearchPageProps) => {
    const {searchResults, userRole, history, fetchSearch} = props;

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

    const isStaffUser = userRole && (userRole == 'ADMIN' || userRole == 'EVENT_MANAGER' || userRole == 'CONTENT_EDITOR' || userRole == 'STAFF');

    const filterResult = function(r: ContentSummaryDTO) {
        const keepElement = (r.id != "_regression_test_" && (!r.tags || r.tags.indexOf("nofilter") < 0 && !r.supersededBy));
        return keepElement || isStaffUser;
    };

    const filteredSearchResults = searchResults && searchResults.results && searchResults.results.filter(filterResult);

    return (
        <Container>
            <Row>
                <Col>
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
