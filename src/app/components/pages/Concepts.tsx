import React, {FormEvent, MutableRefObject, useEffect, useMemo, useRef, useState} from "react";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import {selectors, useAppSelector} from "../../state";
import {Badge, Card, CardBody, CardHeader, Container} from "reactstrap";
import queryString from "query-string";
import {getFilteredStageOptions, isAda, isPhy, isRelevantToPageContext, matchesAllWordsInAnyOrder, pushConceptsToHistory, searchResultIsPublic, shortcuts, stageLabelMap, SUBJECT_SPECIFIC_CHILDREN_MAP, TAG_ID, tags} from "../../services";
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
import { PageMetadata } from "../elements/PageMetadata";
import { FilterSummary } from "./QuestionFinder";

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

    const applicableTags = pageContext?.subject && pageContext?.stage?.length === 1
        ? [
            ...tags.getChildren(subjectToTagMap[pageContext.subject]), 
            ...((SUBJECT_SPECIFIC_CHILDREN_MAP[pageContext.subject][pageContext.stage[0]]?.map(tag => tags.getById(tag))) || [])
        ]
        : [...tags.allSubjectTags, ...tags.allFieldTags];

    const [searchText, setSearchText] = useState(query);
    const [conceptFilters, setConceptFilters] = useState<Tag[]>(applicableTags.filter(f => filters.includes(f.id)));
    const [searchStages, setSearchStages] = useState<Stage[]>(getFilteredStageOptions().filter(s => stages.includes(s.value)).map(s => s.value));
    const [shortcutResponse, setShortcutResponse] = useState<ShortcutResponse[]>();

    const tagIds = useMemo(() => (pageContext?.subject && pageContext?.stage?.length === 1
        ? [pageContext?.subject, ...(SUBJECT_SPECIFIC_CHILDREN_MAP[pageContext.subject][pageContext.stage[0]] ?? [])]
        : tags.allSubjectTags.map(t => t.id)).join(","), [pageContext]
    );

    const listConceptsQuery = useListConceptsQuery(pageContext 
        ? {conceptIds: undefined, tagIds}
        : skipToken
    );

    const shortcutAndFilter = (concepts?: ContentSummaryDTO[], excludeTopicFiltering?: boolean, excludeStageFiltering?: boolean) => {
        const searchResults = concepts?.filter(c =>
            (matchesAllWordsInAnyOrder(c.title, searchText || "") || matchesAllWordsInAnyOrder(c.summary, searchText || ""))
        );

        const filteredSearchResults = searchResults
            ?.filter((result) => excludeTopicFiltering || !filters.length || result?.tags?.some(t => filters.includes(t)))
            .filter((result) => excludeStageFiltering || !searchStages.length || searchStages.some(s => result.audience?.some(a => a.stage?.includes(s))))
            .filter((result) => !pageContext?.stage?.length || isRelevantToPageContext(result.audience, pageContext))
            .filter((result) => searchResultIsPublic(result, user));
    
        const shortcutAndFilteredSearchResults = (shortcutResponse || []).concat(filteredSearchResults || []);

        return shortcutAndFilteredSearchResults;
    };
    
    const filterTags = useMemo(() => [
        conceptFilters.map(t => ({ value: t.id, label: t.title })), 
        searchStages.map(s => ({ value: s, label: stageLabelMap[s] }))
    ].flat()
    , [conceptFilters, searchStages]);

    const removeFilterTag = (value: string) => {
        setConceptFilters(conceptFilters.filter(f => f.id !== value));
        setSearchStages(searchStages.filter(s => s !== value));
    };
    
    const clearFilters = () => {
        setConceptFilters([]);
        setSearchStages([]);
    };
    
    const tagCounts : Record<string, number> = [
        ...applicableTags, 
        ...(pageContext?.subject ? [tags.getById(pageContext?.subject as TAG_ID)] : [])
    ].reduce((acc, t) => ({
        ...acc, 
        // we exclude topics when filtering here to avoid selecting a filter changing the tag counts
        [t.id]: shortcutAndFilter(listConceptsQuery?.data?.results, true, false)?.filter(c => c.tags?.includes(t.id)).length || 0
    }), {});

    const stageCounts = getFilteredStageOptions().reduce((acc, s) => ({
        ...acc,
        // we exclude stages when filtering here to avoid selecting a filter changing the tag counts
        [s.value]: shortcutAndFilter(listConceptsQuery?.data?.results, false, true)?.filter(c => c.audience?.some(a => a.stage?.includes(s.value)))?.length || 0
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

    useEffect(() => doSearch(), [conceptFilters, searchStages]);

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
                    ? <SubjectSpecificConceptListSidebar {...sidebarProps} hideButton /> 
                    : <GenericConceptsSidebar {...sidebarProps} searchStages={searchStages} setSearchStages={setSearchStages} stageCounts={stageCounts} hideButton/>
                }
                <MainContent>
                    <PageMetadata noTitle showSidebarButton>
                        {pageContext?.subject 
                            ? <div className="d-flex align-items-baseline flex-wrap flex-md-nowrap flex-lg-wrap flex-xl-nowrap mt-3">
                                <p className="me-0 me-lg-3">
                                    The concepts shown on this page have been filtered to only show those that are relevant to {getHumanContext(pageContext)}.
                                    You can browse all concepts <Link to="/concepts">here</Link>.
                                </p>
                            </div> 
                            : <p>Use our concept finder to explore all concepts on the Isaac platform.</p>
                        }
                    </PageMetadata>
                    {isPhy && !pageContext?.subject && (!pageContext?.stage || pageContext.stage.length === 0) && <FilterSummary filterTags={filterTags} removeFilterTag={removeFilterTag} clearFilters={clearFilters}/>}
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
                                        ? <ListView type="item" items={shortcutAndFilteredSearchResults}/>
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
