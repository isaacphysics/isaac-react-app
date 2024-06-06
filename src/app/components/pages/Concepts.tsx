import React, {ChangeEvent, FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {AppState, fetchConcepts, selectors, useAppDispatch, useAppSelector} from "../../state";
import * as RS from "reactstrap";
import {Col, Container, Form, Input, Label, Row} from "reactstrap";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {matchesAllWordsInAnyOrder, pushConceptsToHistory, searchResultIsPublic, shortcuts, TAG_ID} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShortcutResponse} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";

// This component is Isaac Physics only (currently)
export const Concepts = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const concepts = useAppSelector((state: AppState) => state?.concepts?.results || null);

    useEffect(() => {dispatch(fetchConcepts());}, [dispatch]);

    const searchParsed = queryString.parse(location.search);

    const queryParsed = searchParsed.query || "";
    const query = queryParsed instanceof Array ? queryParsed[0] : queryParsed;

    const filterParsed = (searchParsed.types || (TAG_ID.physics + "," + TAG_ID.maths + "," + TAG_ID.chemistry + "," + TAG_ID.biology));
    const filters = (Array.isArray(filterParsed) ? filterParsed[0] || "" : filterParsed || "").split(",");

    const physics = filters.includes(TAG_ID.physics);
    const maths = filters.includes(TAG_ID.maths);
    const chemistry = filters.includes(TAG_ID.chemistry);
    const biology = filters.includes(TAG_ID.biology);

    let [searchText, setSearchText] = useState(query);
    let [conceptFilterPhysics, setConceptFilterPhysics] = useState(physics);
    let [conceptFilterMaths, setConceptFilterMaths] = useState(maths);
    let [conceptFilterChemistry, setConceptFilterChemistry] = useState(chemistry);
    let [conceptFilterBiology, setConceptFilterBiology] = useState(biology);
    let [shortcutResponse, setShortcutResponse] = useState<ShortcutResponse[]>();

    function doSearch(e?: FormEvent<HTMLFormElement>) {
        if (e) {
            e.preventDefault();
        }
        if (searchText != query || conceptFilterPhysics != physics || conceptFilterMaths != maths || conceptFilterChemistry != chemistry || conceptFilterBiology != biology) {
            pushConceptsToHistory(history, searchText || "", conceptFilterPhysics, conceptFilterMaths, conceptFilterChemistry, conceptFilterBiology);
        }
        if (searchText) {
            setShortcutResponse(shortcuts(searchText));
        }
    }

    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        timer.current = window.setTimeout(() => {
            doSearch();
        }, 300);
        return () => {
            clearTimeout(timer.current);
        };
    }, [searchText]);

    useEffect(() => {doSearch();}, [conceptFilterPhysics, conceptFilterMaths, conceptFilterChemistry, conceptFilterBiology]);

    const searchResults = concepts
        ?.filter(c =>
            matchesAllWordsInAnyOrder(c.title, searchText || "") ||
            matchesAllWordsInAnyOrder(c.summary, searchText || "")
        );

    const filteredSearchResults = searchResults
        ?.filter((result) => result?.tags?.some(t => filters.includes(t)))
        .filter((result) => searchResultIsPublic(result, user));

    const shortcutAndFilteredSearchResults = (shortcutResponse || []).concat(filteredSearchResults || []);

    return (
        <Container id="search-page">
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Concepts" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form className="form-inline" onSubmit={doSearch}>
                        <Input
                            className='search--filter-input mt-4'
                            type="search" value={searchText || ""}
                            placeholder="Search concepts"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                        />
                    </Form>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col className="py-4">
                    <RS.Card>
                        <RS.CardHeader className="search-header">
                            <Col lg={4} md={3} xs={12}>
                                <h3>
                                    <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results {query != "" ? shortcutAndFilteredSearchResults ? <RS.Badge color="primary">{shortcutAndFilteredSearchResults.length}</RS.Badge> : <IsaacSpinner /> : null}
                                </h3>
                            </Col>
                            <Col lg={8} md={9} xs={12}>
                                <Form id="concept-filter" className="form-inline search-filters">
                                    <Label for="concept-filter" className="d-none d-sm-inline-block">Filter:</Label>
                                    <Label>
                                        <Input id="problem-search-phy" type="checkbox" defaultChecked={conceptFilterPhysics} onChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilterPhysics(e.target.checked)} />
                                        <span className="visually-hidden">Show </span>Physics<span className="visually-hidden"> concept</span>
                                    </Label>
                                    <Label>
                                        <Input id="concept-search-maths" type="checkbox" defaultChecked={conceptFilterMaths} onChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilterMaths(e.target.checked)} />
                                        <span className="visually-hidden">Show </span>Maths<span className="visually-hidden"> concept</span>
                                    </Label>
                                    <Label>
                                        <Input id="concept-search-chem" type="checkbox" defaultChecked={conceptFilterChemistry} onChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilterChemistry(e.target.checked)} />
                                        <span className="visually-hidden">Show </span>Chemistry<span className="visually-hidden"> concept</span>
                                    </Label>
                                    <Label>
                                        <Input id="concept-search-bio" type="checkbox" defaultChecked={conceptFilterBiology} onChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilterBiology(e.target.checked)} />
                                        <span className="visually-hidden">Show </span>Biology<span className="visually-hidden"> concept</span>
                                    </Label>
                                </Form>
                            </Col>
                        </RS.CardHeader>
                        <RS.CardBody>
                            <ShowLoading until={shortcutAndFilteredSearchResults}>
                                {shortcutAndFilteredSearchResults ?
                                    <LinkToContentSummaryList items={shortcutAndFilteredSearchResults} displayTopicTitle={false}/>
                                    : <em>No results found</em>}
                            </ShowLoading>
                        </RS.CardBody>
                    </RS.Card>
                </Col>
            </Row>
        </Container>
    );
});
