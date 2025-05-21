import React, {FormEvent, MutableRefObject, useEffect, useMemo, useRef, useState} from "react";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import {selectors, useAppSelector} from "../../state";
import {Badge, Card, CardBody, CardHeader, Container} from "reactstrap";
import queryString from "query-string";
import {getFilteredStageOptions, isAda, isPhy, isRelevantToPageContext, matchesAllWordsInAnyOrder, pushConceptsToHistory, searchResultIsPublic, shortcuts, TAG_ID, tags} from "../../services";
import {generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShortcutResponse, Tag} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import { ListView } from "../elements/list-groups/ListView";
import { ContentTypeVisibility, LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { SubjectSpecificConceptListSidebar, MainContent, SidebarLayout, GenericConceptsSidebar } from "../elements/layout/SidebarLayout";
import { getHumanContext, isFullyDefinedContext, useUrlPageTheme } from "../../services/pageContext";
import { useListConceptsQuery } from "../../state/slices/api/conceptsApi";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { ContentSummaryDTO, Stage } from "../../../IsaacApiTypes";
import { skipToken } from "@reduxjs/toolkit/query";
import { AffixButton } from "../elements/AffixButton";

const subjectToTagMap = {
    physics: TAG_ID.physics,
    chemistry: TAG_ID.chemistry,
    biology: TAG_ID.biology,
    maths: TAG_ID.maths,
};

// This component is Isaac Physics only (currently)
export const Concepts = withRouter((props: RouteComponentProps) => {
    const {location, history} = props;
    const user = useAppSelector(selectors.user.orNull);
    const pageContext = useUrlPageTheme();

    const searchParsed = queryString.parse(location.search, {arrayFormat: "comma"});

    const [query, filters, stages] = useMemo(() => {
        const queryParsed = searchParsed.query || null;
        const query = Array.isArray(queryParsed) ? queryParsed.join(",") : queryParsed;
    
        const filterParsed = searchParsed.types || null;
        const filters = Array.isArray(filterParsed) ? filterParsed.filter(x => !!x) as string[] : filterParsed?.split(",") ?? [];

        const stagesParsed = searchParsed.stages || null;
        const stages = Array.isArray(stagesParsed) ? stagesParsed.filter(x => !!x) as string[] : stagesParsed?.split(",") ?? [];

        return [query, filters, stages];
    }, [searchParsed]);

    const applicableTags = pageContext?.subject
        ? tags.getDirectDescendents(subjectToTagMap[pageContext.subject])
        : [...tags.allSubjectTags, ...tags.allFieldTags];

    const [searchText, setSearchText] = useState(query);
    const [conceptFilters, setConceptFilters] = useState<Tag[]>(
        applicableTags.filter(f => filters.includes(f.id))
    );
    const [searchStages, setSearchStages] = useState<Stage[]>(stages as Stage[]);
    const [shortcutResponse, setShortcutResponse] = useState<ShortcutResponse[]>();

    const listConceptsQuery = useListConceptsQuery(pageContext 
        ? {conceptIds: undefined, tagIds: pageContext?.subject ?? tags.allSubjectTags.map(t => t.id).join(",")}
        : skipToken
    );

    const shortcutAndFilter = (concepts?: ContentSummaryDTO[], excludeTopicFiltering?: boolean) => {
        const searchResults = concepts?.filter(c =>
            (matchesAllWordsInAnyOrder(c.title, searchText || "") || matchesAllWordsInAnyOrder(c.summary, searchText || ""))
            && (searchStages.length === 0 || searchStages.some(s => c.audience?.some(a => a.stage?.includes(s))))
        );
        
        const filteredSearchResults = searchResults
            ?.filter((result) => excludeTopicFiltering || !filters.length || result?.tags?.some(t => filters.includes(t)))
            .filter((result) => !pageContext?.stage?.length || isRelevantToPageContext(result.audience, pageContext))
            .filter((result) => searchResultIsPublic(result, user));
    
        const shortcutAndFilteredSearchResults = (shortcutResponse || []).concat(filteredSearchResults || []);

        return shortcutAndFilteredSearchResults;
    };
    
    const tagCounts : Record<string, number> = [
        ...applicableTags, 
        ...(pageContext?.subject ? [tags.getById(pageContext?.subject as TAG_ID)] : [])
    ].reduce((acc, t) => ({
        ...acc, 
        // we exclude topics when filtering here to avoid selecting a filter changing the tag counts
        [t.id]: shortcutAndFilter(listConceptsQuery?.data?.results, true)?.filter(c => c.tags?.includes(t.id)).length || 0
    }), {});

    const stageCounts = getFilteredStageOptions().reduce((acc, s) => ({
        ...acc, 
        [s.value]: listConceptsQuery?.data?.results?.filter(c => c.audience?.some(a => a.stage?.includes(s.value))
            && (!filters.length || c.tags?.some(t => filters.includes(t))))?.length || 0
    }), {});

    function doSearch(e?: FormEvent<HTMLFormElement>) {
        if (e) {
            e.preventDefault();
        }
        pushConceptsToHistory(history, searchText || "", [...conceptFilters.map(f => f.id)], searchStages);

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

    useEffect(() => {doSearch();}, [conceptFilters, searchStages]);

    const crumb = isPhy && isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    const sidebarProps = {searchText, setSearchText, conceptFilters, setConceptFilters, applicableTags, tagCounts};

    return (
        <Container id="search-page" { ...(pageContext?.subject && { "data-bs-theme" : pageContext.subject })}>
            <TitleAndBreadcrumb 
                currentPageTitle="Concepts" 
                intermediateCrumbs={crumb ? [crumb] : undefined}
                icon={{type: "hex", icon: "icon-concept"}}
                className="mb-4"
            />
            <SidebarLayout>
                {pageContext?.subject 
                    ? <SubjectSpecificConceptListSidebar {...sidebarProps}/> 
                    : <GenericConceptsSidebar {...sidebarProps} searchStages={searchStages} setSearchStages={setSearchStages} stageCounts={stageCounts}/>
                }
                <MainContent>
                    {pageContext?.subject && <div className="d-flex align-items-baseline flex-wrap flex-md-nowrap">
                        <p className="me-3 mt-2">The concepts shown on this page have been filtered to only show those that are relevant to {getHumanContext(pageContext)}.</p>
                        <AffixButton size="md" color="keyline" tag={Link} to="/concepts" className="ms-auto" style={{minWidth: "136px"}}
                            affix={{
                                affix: "icon-right",
                                position: "suffix",
                                type: "icon"
                            }}>
                            Browse all concepts
                        </AffixButton>
                    </div>}
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
