import React, {FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {AppState, fetchConcepts, selectors, useAppDispatch, useAppSelector} from "../../state";
import {Badge, Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import queryString from "query-string";
import {ShowLoading} from "../handlers/ShowLoading";
import {ContentTypeVisibility, LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {matchesAllWordsInAnyOrder, pushConceptsToHistory, searchResultIsPublic, shortcuts, TAG_ID, tags} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShortcutResponse, Tag} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import { SubjectSpecificConceptListSidebar, MainContent, SidebarContainer } from "../elements/layout/SidebarLayout";

// This component is Isaac Physics only (currently)
export const Concepts = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const concepts = useAppSelector((state: AppState) => state?.concepts?.results || null);

    const subject = useAppSelector(selectors.pageContext.subject);

    const subjectToTagMap = {
        physics: TAG_ID.physics,
        chemistry: TAG_ID.chemistry,
        biology: TAG_ID.biology,
        maths: TAG_ID.maths,
    };
    
    const applicableTags = tags.getDirectDescendents(subjectToTagMap[subject ?? "physics"]); 
    const tagCounts : Record<string, number> = applicableTags.reduce((acc, t) => ({...acc, [t.id]: concepts?.filter(c => c.tags?.includes(t.id)).length || 0}), {});

    useEffect(() => {dispatch(fetchConcepts());}, [dispatch]);

    const searchParsed = queryString.parse(location.search);

    const queryParsed = searchParsed.query || "";
    const query = queryParsed instanceof Array ? queryParsed[0] : queryParsed;

    const filterParsed = (searchParsed.types || (TAG_ID.physics + "," + TAG_ID.maths + "," + TAG_ID.chemistry + "," + TAG_ID.biology));
    const filters = (Array.isArray(filterParsed) ? filterParsed[0] || "" : filterParsed || "").split(",");

    const [searchText, setSearchText] = useState(query);
    const [conceptFilters, setConceptFilters] = useState<Tag[]>(
        applicableTags.filter(f => filters.includes(f.id))
    );

    const [shortcutResponse, setShortcutResponse] = useState<ShortcutResponse[]>();

    function doSearch(e?: FormEvent<HTMLFormElement>) {
        if (e) {
            e.preventDefault();
        }
        pushConceptsToHistory(history, searchText || "", conceptFilters.map(f => f.id));

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

    useEffect(() => {doSearch();}, [conceptFilters]);

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
        <SidebarContainer id="search-page">
            <SubjectSpecificConceptListSidebar 
                searchText={searchText} setSearchText={setSearchText} 
                conceptFilters={conceptFilters} setConceptFilters={setConceptFilters}
                applicableTags={applicableTags} tagCounts={tagCounts}
            />
            <MainContent>
                <TitleAndBreadcrumb currentPageTitle="Concepts" />
                <Row className="mb-4">
                    <Col className="py-4">
                        <Card>
                            <CardHeader className="search-header">
                                <h3>
                                    <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results {query != "" ? shortcutAndFilteredSearchResults ? <Badge color="primary">{shortcutAndFilteredSearchResults.length}</Badge> : <IsaacSpinner /> : null}
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <ShowLoading until={shortcutAndFilteredSearchResults}>
                                    {shortcutAndFilteredSearchResults ?
                                        <LinkToContentSummaryList 
                                            items={shortcutAndFilteredSearchResults} showBreadcrumb={false} 
                                            contentTypeVisibility={ContentTypeVisibility.ICON_ONLY}
                                        />
                                        : <em>No results found</em>}
                                </ShowLoading>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </MainContent>
        </SidebarContainer>
    );
});
