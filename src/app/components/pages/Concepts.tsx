import React, {FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {selectors, useAppSelector} from "../../state";
import {Badge, Card, CardBody, CardHeader, Container} from "reactstrap";
import queryString from "query-string";
import {isAda, isPhy, matchesAllWordsInAnyOrder, pushConceptsToHistory, searchResultIsPublic, shortcuts, TAG_ID, tags} from "../../services";
import {generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShortcutResponse, Tag} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import { ListView } from "../elements/list-groups/ListView";
import { ContentTypeVisibility, LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { SubjectSpecificConceptListSidebar, MainContent, SidebarLayout, GenericConceptsSidebar } from "../elements/layout/SidebarLayout";
import { isFullyDefinedContext, useUrlPageTheme } from "../../services/pageContext";
import { useListConceptsQuery } from "../../state/slices/api/conceptsApi";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { ContentSummaryDTO } from "../../../IsaacApiTypes";

// This component is Isaac Physics only (currently)
export const Concepts = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const user = useAppSelector(selectors.user.orNull);
    const pageContext = useUrlPageTheme();

    const listConceptsQuery = useListConceptsQuery({conceptIds: undefined, tagIds: pageContext?.subject});

    const subjectToTagMap = {
        physics: TAG_ID.physics,
        chemistry: TAG_ID.chemistry,
        biology: TAG_ID.biology,
        maths: TAG_ID.maths,
    };
    
    const applicableTags = pageContext?.subject ? tags.getDirectDescendents(subjectToTagMap[pageContext.subject]) : tags.allFieldTags;
    
    const tagCounts : Record<string, number> = [...applicableTags, ...(pageContext?.subject ? [tags.getById(pageContext?.subject as TAG_ID)] : [])].reduce((acc, t) => ({...acc, [t.id]: listConceptsQuery?.data?.results?.filter(c => c.tags?.includes(t.id)).length || 0}), {});

    const searchParsed = queryString.parse(location.search);

    const queryParsed = searchParsed.query || "";
    const query = queryParsed instanceof Array ? queryParsed[0] : queryParsed;

    const filterParsed = (searchParsed.types || (TAG_ID.physics + "," + TAG_ID.maths + "," + TAG_ID.chemistry + "," + TAG_ID.biology));
    const filters = (Array.isArray(filterParsed) ? filterParsed[0] || "" : filterParsed || "").split(",");

    const [searchText, setSearchText] = useState(query);
    const [conceptFilters, setConceptFilters] = useState<Tag[]>([
        ...(pageContext?.subject ? [tags.getById(subjectToTagMap[pageContext.subject])] : []),
        ...applicableTags.filter(f => filters.includes(f.id))
    ]);

    const [shortcutResponse, setShortcutResponse] = useState<ShortcutResponse[]>();

    function doSearch(e?: FormEvent<HTMLFormElement>) {
        if (e) {
            e.preventDefault();
        }
        pushConceptsToHistory(history, searchText || "", [...conceptFilters.map(f => f.id)]);

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

    const shortcutAndFilter = (concepts?: ContentSummaryDTO[]) => {
        const searchResults = concepts
            ?.filter(c =>
                matchesAllWordsInAnyOrder(c.title, searchText || "") ||
                matchesAllWordsInAnyOrder(c.summary, searchText || "")
            );
    
        const filteredSearchResults = searchResults
            ?.filter((result) => result?.tags?.some(t => filters.includes(t)))
            .filter((result) => searchResultIsPublic(result, user));
    
        const shortcutAndFilteredSearchResults = (shortcutResponse || []).concat(filteredSearchResults || []);

        return shortcutAndFilteredSearchResults;
    };

    const crumb = isPhy && isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    const sidebarProps = {searchText, setSearchText, conceptFilters, setConceptFilters, applicableTags, tagCounts};

    return (
        <Container id="search-page" { ...(pageContext?.subject && { "data-bs-theme" : pageContext.subject })}>
            <TitleAndBreadcrumb 
                currentPageTitle="Concepts" 
                intermediateCrumbs={crumb ? [crumb] : undefined}
                icon={{type: "hex", icon: "icon-concept"}}
            />
            <SidebarLayout>
                {pageContext?.subject 
                    ? <SubjectSpecificConceptListSidebar {...sidebarProps}/> 
                    : <GenericConceptsSidebar {...sidebarProps}/>
                }
                <MainContent>
                    {isPhy && <div className="list-results-container p-2 my-4">
                        <ShowLoadingQuery
                            query={listConceptsQuery}
                            thenRender={({results: concepts}) => {

                                const shortcutAndFilteredSearchResults = shortcutAndFilter(concepts);

                                return <>
                                    {!!shortcutAndFilteredSearchResults.length && <div className="p-2 py-3">
                                        Showing <b>{shortcutAndFilteredSearchResults.length}</b> results
                                    </div>}
            
                                    {shortcutAndFilteredSearchResults.length
                                        ? <ListView items={shortcutAndFilteredSearchResults}/>
                                        : <em>No results found</em>
                                    }
                                </>;
                            }}
                            defaultErrorTitle="Error fetching concepts"
                        />
                    </div>
                    }
                    
                    {isAda && <Card>
                        <CardHeader className="search-header">
                            <h3>
                                <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results 
                                {query !== "" 
                                    ? (listConceptsQuery?.data?.totalResults) 
                                        ? <Badge color="primary">{listConceptsQuery?.data?.totalResults}</Badge> 
                                        : <IsaacSpinner /> 
                                    : null
                                }
                            </h3>
                        </CardHeader>
                        <CardBody className="px-2">
                            <ShowLoadingQuery
                                query={listConceptsQuery}
                                thenRender={({results: concepts}) => {

                                    const shortcutAndFilteredSearchResults = shortcutAndFilter(concepts);

                                    return <>
                                        {shortcutAndFilteredSearchResults ?
                                            <LinkToContentSummaryList 
                                                items={shortcutAndFilteredSearchResults} showBreadcrumb={false} 
                                                contentTypeVisibility={ContentTypeVisibility.ICON_ONLY}
                                            />
                                            : <em>No results found</em>}
                                    </>;
                                }}
                                defaultErrorTitle="Error fetching concepts"
                            />
                        </CardBody>
                    </Card>}
                </MainContent>
            </SidebarLayout>
        </Container>
    );
});
