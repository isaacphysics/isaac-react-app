import React, {ChangeEvent, FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {AppState, fetchConcepts, selectors, useAppDispatch, useAppSelector} from "../../state";
import * as RS from "reactstrap";
import {Col, Container, CustomInput, Form, Input, Label, Row} from "reactstrap";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {pushConceptsToHistory, searchResultIsPublic, shortcuts, TAG_ID} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShortcutResponse} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";


export const Concepts = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const concepts = useAppSelector((state: AppState) => state?.concepts?.results || null);

    useEffect(() => {dispatch(fetchConcepts());}, [dispatch]);

    const searchParsed = queryString.parse(location.search);

    const queryParsed = searchParsed.query || "";
    const query = queryParsed instanceof Array ? queryParsed[0] : queryParsed;

    const filterParsed = (searchParsed.types || (TAG_ID.physics + "," + TAG_ID.maths + "," + TAG_ID.chemistry));
    const filters = (Array.isArray(filterParsed) ? filterParsed[0] || "" : filterParsed || "").split(",");

    const physics = filters.includes(TAG_ID.physics);
    const maths = filters.includes(TAG_ID.maths);
    const chemistry = filters.includes(TAG_ID.chemistry);

    let [searchText, setSearchText] = useState(query);
    let [conceptFilterPhysics, setConceptFilterPhysics] = useState(physics);
    let [conceptFilterMaths, setConceptFilterMaths] = useState(maths);
    let [conceptFilterChemistry, setConceptFilterChemistry] = useState(chemistry);
    let [shortcutResponse, setShortcutResponse] = useState<ShortcutResponse[]>();

    function doSearch(e?: FormEvent<HTMLFormElement>) {
        if (e) {
            e.preventDefault();
        }
        if (searchText != query || conceptFilterPhysics != physics || conceptFilterMaths != maths || conceptFilterChemistry != chemistry) {
            pushConceptsToHistory(history, searchText || "", conceptFilterPhysics, conceptFilterMaths, conceptFilterChemistry);
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

    useEffect(() => {doSearch();}, [conceptFilterPhysics, conceptFilterMaths, conceptFilterChemistry]);

    const searchResults = concepts
        ?.filter(c =>
            c?.title?.toLowerCase().includes((searchText || "").toLowerCase()) ||
            c?.summary?.toLowerCase().includes((searchText || "").toLowerCase())
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
                    <Form inline onSubmit={doSearch}>
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
                            <Col md={5} xs={12}>
                                <h3>
                                    <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results {query != "" ? shortcutAndFilteredSearchResults ? <RS.Badge color="primary">{shortcutAndFilteredSearchResults.length}</RS.Badge> : <IsaacSpinner /> : null}
                                </h3>
                            </Col>
                            <Col md={7} xs={12}>
                                <Form id="concept-filter" inline className="search-filters">
                                    <Label for="concept-filter" className="d-none d-sm-inline-block">Filter:</Label>
                                    <Label>
                                        <CustomInput id="problem-search-phy" type="checkbox" defaultChecked={conceptFilterPhysics} onChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilterPhysics(e.target.checked)} />
                                        <span className="sr-only">Show </span>Physics<span className="sr-only"> concept</span>
                                    </Label>
                                    <Label>
                                        <CustomInput id="concept-search-maths" type="checkbox" defaultChecked={conceptFilterMaths} onChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilterMaths(e.target.checked)} />
                                        <span className="sr-only">Show </span>Maths<span className="sr-only"> concept</span>
                                    </Label>
                                    <Label>
                                        <CustomInput id="concept-search-chem" type="checkbox" defaultChecked={conceptFilterChemistry} onChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilterChemistry(e.target.checked)} />
                                        <span className="sr-only">Show </span>Chemistry<span className="sr-only"> concept</span>
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
