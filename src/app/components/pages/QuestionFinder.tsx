import React, {useCallback, useEffect, useMemo, useState} from "react";
import {AppState, clearQuestionSearch, searchQuestions, useAppDispatch, useAppSelector} from "../../state";
import debounce from "lodash/debounce";
import {
    above,
    arrayFromPossibleCsv,
    below,
    BookInfo,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    getFilteredExamBoardOptions,
    getHumanContext,
    getQuestionPlaceholder,
    ISAAC_BOOKS,
    isAda,
    isDefined,
    isFullyDefinedContext,
    isLoggedIn,
    isPhy,
    Item,
    itemiseTag,
    LearningStage,
    ListParams,
    nextSeed,
    SEARCH_RESULTS_PER_PAGE,
    simpleDifficultyLabelMap,
    siteSpecific,
    STAGE,
    STAGE_NULL_OPTIONS,
    stageLabelMap,
    TAG_ID,
    tags,
    toSimpleCSV,
    useDeviceSize,
    useQueryParams,
    useUrlPageTheme,
} from "../../services";
import {ContentSummaryDTO, Difficulty, ExamBoard} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {RouteComponentProps, useHistory, withRouter} from "react-router";
import {ShowLoading} from "../handlers/ShowLoading";
import {generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import classNames from "classnames";
import queryString from "query-string";
import {Button, Card, CardBody, CardHeader, Col, Container, Label, Row} from "reactstrap";
import {ChoiceTree, getChoiceTreeLeaves, QuestionFinderFilterPanel} from "../elements/panels/QuestionFinderFilterPanel";
import {TierID} from "../elements/svg/HierarchyFilter";
import { MainContent, QuestionFinderSidebar, SidebarLayout } from "../elements/layout/SidebarLayout";
import { ListView } from "../elements/list-groups/ListView";
import { ContentTypeVisibility, LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { PageFragment } from "../elements/PageFragment";
import { RenderNothing } from "../elements/RenderNothing";
import { processTagHierarchy, pruneTreeNode } from "../../services/questionHierarchy";
import { SearchInputWithIcon } from "../elements/SearchInputs";
import { AffixButton } from "../elements/AffixButton";
import { Link } from "react-router-dom";
import { updateTopicChoices } from "../../services";

// Type is used to ensure that we check all query params if a new one is added in the future
const FILTER_PARAMS = ["query", "topics", "fields", "subjects", "stages", "difficulties", "examBoards", "book", "excludeBooks", "statuses", "randomSeed"] as const;
type FilterParams = typeof FILTER_PARAMS[number];

export interface QuestionStatus {
    notAttempted: boolean;
    complete: boolean;
    tryAgain: boolean;
}

function questionStatusToURIComponent(statuses: QuestionStatus): string {
    return Object.entries(statuses)
        .filter(e => e[1])
        .map(e => {
            switch(e[0]) {
                case "notAttempted": return "NOT_ATTEMPTED";
                case "complete": return "ALL_CORRECT";
                case "tryAgain": return "IN_PROGRESS";
            }
        })
        .join(",");
}

function getInitialQuestionStatuses(params: ListParams<FilterParams>): QuestionStatus {
    const statuses = arrayFromPossibleCsv(params.statuses);
    if (statuses.length < 1) {
        // If no statuses set use default
        return {
            notAttempted: false,
            complete: false,
            tryAgain: false,
        };
    }
    else {
        // otherwise set use the URI components
        return {
            notAttempted: statuses.includes("notAttempted"),
            complete: statuses.includes("complete"),
            tryAgain: statuses.includes("tryAgain"),
        };
    }
}

export function pageStageToSearchStage(stage?: LearningStage[]): STAGE[] {
    if (!stage || stage.length === 0) return [];
    switch (stage[0]) {
        case "11_14": return [STAGE.YEAR_7_AND_8, STAGE.YEAR_9];
        case "gcse": return [STAGE.GCSE];
        case "a_level": return [STAGE.A_LEVEL, STAGE.FURTHER_A];
        case "university": return [STAGE.UNIVERSITY];
        default: return [];
    }
}

export const QuestionFinder = withRouter(({location}: RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: AppState) => state && state.user);
    const params = useQueryParams<FilterParams, false>(false);
    const history = useHistory();
    const pageContext = useUrlPageTheme();
    const deviceSize = useDeviceSize();
    const isSolitaryStage = pageStageToSearchStage(pageContext?.stage).length === 1;
    const [selections, setSelections] = useState<ChoiceTree[]>([]); // we can't populate this until we have the page context
    const [searchTopics, setSearchTopics] = useState<string[]>(arrayFromPossibleCsv(params.topics));
    const [searchQuery, setSearchQuery] = useState<string>(params.query ? (params.query instanceof Array ? params.query[0] : params.query) : "");
    const [searchStages, setSearchStages] = useState<STAGE[]>(arrayFromPossibleCsv(params.stages).concat(isSolitaryStage ? pageStageToSearchStage(pageContext?.stage)[0] : []) as STAGE[]);
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>(arrayFromPossibleCsv(params.difficulties) as Difficulty[]);
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>(arrayFromPossibleCsv(params.examBoards) as ExamBoard[]);
    const [searchStatuses, setSearchStatuses] = useState<QuestionStatus>(getInitialQuestionStatuses(params));
    const [searchBooks, setSearchBooks] = useState<string[]>(arrayFromPossibleCsv(params.book));
    const [excludeBooks, setExcludeBooks] = useState<boolean>(!!params.excludeBooks);
    const [searchDisabled, setSearchDisabled] = useState(true);
    const [randomSeed, setRandomSeed] = useState<number | undefined>(params.randomSeed === undefined ? undefined : parseInt(params.randomSeed.toString()));
    
    const [readingFromUrlParams, setReadingFromUrlParams] = useState(FILTER_PARAMS.some(p => params[p]));

    useEffect(function populateFiltersFromAccountSettings() {
        // on isaac, we should only do this if we are not on a subject-specific QF
        if (isLoggedIn(user) && (!isPhy || (pageContext && !pageContext.subject))) {
            const filtersHaveNotBeenSpecifiedByQueryParams = FILTER_PARAMS.every(p => !params[p]);
            if (filtersHaveNotBeenSpecifiedByQueryParams) {
                const accountStages = user.registeredContexts?.map(c => c.stage).filter(s => s) as STAGE[];
                const allStagesSelected = accountStages?.some(stage => STAGE_NULL_OPTIONS.includes(stage));
                if (!allStagesSelected && (isPhy || accountStages.length === 1)) { // Ada only want to apply stages filter if there is only one
                    setSearchStages(accountStages);
                }
                const examBoardStages = user.registeredContexts?.map(c => c.examBoard).filter(e => e) as EXAM_BOARD[];
                const allExamBoardsSelected = examBoardStages?.some(examBoard => EXAM_BOARD_NULL_OPTIONS.includes(examBoard));
                if (isAda && !allExamBoardsSelected && examBoardStages.length === 1) { // Phy does not have exam boards
                    setSearchExamBoards(examBoardStages);
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this to re-run on params change.
    }, [user, pageContext]);

    useEffect(() => {
        if (pageContext) {
            // on physics' subject-QFs, the url path (i.e. pageContext.subject) is the first tier of the hierarchy.
            setSelections(
                processTagHierarchy(
                    tags,
                    arrayFromPossibleCsv(params.subjects).concat(pageContext?.subject ? [pageContext.subject] : []),
                    arrayFromPossibleCsv(params.fields), 
                    arrayFromPossibleCsv(params.topics)
                )
            );
        }
    }, [pageContext]);

    const [disableLoadMore, setDisableLoadMore] = useState(false);

    const choices = useMemo(() => {
        return updateTopicChoices(selections, pageContext);
    }, [selections, pageContext]);

    const isEmptySearch = (query: string, topics: string[], books: string[], stages: string[], difficulties: string[], examBoards: string[], selections: ChoiceTree[]) => {
        return [query, topics, books, stages, difficulties, examBoards].every(v => v.length === 0) && selections.every(v => Object.keys(v).length === 0);
    };

    // this should only update when a new search is triggered, not (necessarily) when the filters change
    const [isCurrentSearchEmpty, setIsCurrentSearchEmpty] = useState(isEmptySearch(searchQuery, searchTopics, searchBooks, searchStages, searchDifficulties, searchExamBoards, selections));

    const {results: questions, totalResults: totalQuestions, nextSearchOffset} = useAppSelector((state: AppState) => state && state.questionSearchResult) || {};

    const debouncedSearch = useMemo(() => 
        debounce(({
            searchQuery: searchString,
            searchTopics: topics, 
            searchExamBoards: examBoards, 
            searchBooks: book, 
            searchStages: stages,
            searchDifficulties: difficulties, 
            selections: hierarchySelections, 
            excludeBooks, 
            searchStatuses: questionStatuses,
            startIndex, randomSeed
        }) => {
            if (isEmptySearch(searchString, topics, book, stages, difficulties, examBoards, hierarchySelections)) {
                setIsCurrentSearchEmpty(true);
                dispatch(clearQuestionSearch);
                return;
            }

            setIsCurrentSearchEmpty(false);

            dispatch(searchQuestions({
                searchString: searchString || undefined,
                tags: getChoiceTreeLeaves(hierarchySelections).map(leaf => leaf.value).join(",") || undefined,
                topics: siteSpecific(undefined, [...topics].filter((query) => query != "").join(",") || undefined),
                books: (!excludeBooks && book.join(",")) || undefined,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoards.join(",") || undefined,
                questionCategories: isPhy
                    ? (excludeBooks ? "problem_solving" : "problem_solving,book")
                    : undefined,
                statuses: questionStatusToURIComponent(questionStatuses),
                fasttrack: false,
                startIndex,
                limit: SEARCH_RESULTS_PER_PAGE + 1, // request one more than we need to know if there are more results
                randomSeed
            }));
        }, 250),
    [dispatch]);

    
    const filteringByStatus = Object.values(searchStatuses).some(v => v) && !Object.values(searchStatuses).every(v => v);

    const searchAndUpdateURL = useCallback(() => {
        setPageCount(1);
        setDisableLoadMore(false);
        setDisplayQuestions(undefined);
        
        const filteredStages = !searchStages.length && pageContext?.stage ? pageStageToSearchStage(pageContext.stage) : searchStages;
        debouncedSearch({
            searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages: filteredStages,
            searchDifficulties, selections, excludeBooks, searchStatuses, startIndex: 0, randomSeed
        });
        
        if (!selections.length) return;
        setReadingFromUrlParams(false);

        const params: {[key: string]: string} = {};
        if (searchStages.length) {
            params.stages = toSimpleCSV(searchStages
                .filter(s => isSolitaryStage ? !pageStageToSearchStage(pageContext?.stage).includes(s) : true));
            if (params.stages === "") delete params.stages;
        }
        if (searchDifficulties.length) params.difficulties = toSimpleCSV(searchDifficulties);
        if (searchQuery.length) params.query = encodeURIComponent(searchQuery);
        if (searchTopics.length) params.topics = toSimpleCSV(searchTopics);
        if (isAda && searchExamBoards.length) params.examBoards = toSimpleCSV(searchExamBoards);
        if (isPhy && !excludeBooks && searchBooks.length) {
            params.book = toSimpleCSV(searchBooks);
        }
        if (isPhy && excludeBooks) params.excludeBooks = "set";
        if (filteringByStatus) {
            params.statuses = Object.entries(searchStatuses)
                .filter(([_k, isSet]) => isSet)
                .map(([status, _v]) => status).join(",");
        }

        if (isPhy) {
            (["subjects", "fields", "topics"] as TierID[]).forEach((tier, i) => {
                if (!selections[i] || Object.keys(selections[i]).length === 0) {
                    return;
                }
                params[tier] = Object.values(selections[i])
                    .flat().map(item => item.value)
                    .filter(v => v !== pageContext?.subject).join(",");
                if (params[tier] === "") delete params[tier];
            });
        }
        if (randomSeed !== undefined) params.randomSeed = randomSeed.toString();

        history.replace({search: queryString.stringify(params, {encode: false}), state: history.location.state});
    }, [searchStages, pageContext, debouncedSearch, searchQuery, searchTopics, searchExamBoards, searchBooks, searchDifficulties, selections, excludeBooks, searchStatuses, filteringByStatus, history, isSolitaryStage, randomSeed]);

    // Automatically search for content whenever the searchQuery changes, without changing whether filters have been applied or not
    useEffect(() => {
        searchAndUpdateURL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, randomSeed]);

    // If the stages filter changes, update the exam board filter selections to remove now-incompatible ones
    useEffect(() => {
        if (isAda) {
            setSearchExamBoards(examBoards =>
                getFilteredExamBoardOptions({byStages: searchStages})
                    .filter(o => examBoards.includes(o.value))
                    .map(o => o.value)
            );
        }
    }, [searchStages]);

    const questionList = useMemo(() => {
        if (questions) {
            if (questions.length < SEARCH_RESULTS_PER_PAGE + 1) {
                setDisableLoadMore(true);
            } else {
                setDisableLoadMore(false);
            }

            return questions.slice(0, SEARCH_RESULTS_PER_PAGE);
        }
    }, [questions]);

    const [displayQuestions, setDisplayQuestions] = useState<ContentSummaryDTO[] | undefined>([]);
    const [pageCount, setPageCount] = useState(1);

    const [validFiltersSelected, setValidFiltersSelected] = useState(false);

    useEffect(() => {
        if (displayQuestions && nextSearchOffset && pageCount > 1) {
            setDisplayQuestions(dqs => [...dqs ?? [], ...questionList ?? []]);
        } else {
            setDisplayQuestions(questionList);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionList]);

    useEffect(function onFiltersChanged() {
        setSearchDisabled(false);
        setValidFiltersSelected(searchDifficulties.length > 0
            || searchTopics.length > 0
            || searchExamBoards.length > 0
            || searchStages.length > 0
            || searchBooks.length > 0
            || excludeBooks
            || selections.some(tier => Object.values(tier).flat().length > 0)
            || Object.entries(searchStatuses).some(e => e[1]));

        if (isPhy) {
            if (!readingFromUrlParams) {
                setRandomSeed(undefined);
            }
            
            // on physics, we immediately update the search if filters change; on ada, we wait until "Apply filters" is clicked
            searchAndUpdateURL();
        }

    }, [searchDifficulties, searchTopics, searchExamBoards, searchStages, searchBooks, excludeBooks, selections, searchStatuses, searchQuery]);

    const clearFilters = useCallback(() => {
        setSearchDifficulties([]);
        setSearchTopics([]);
        setSearchExamBoards([]);
        setSearchStages(isSolitaryStage ? pageStageToSearchStage(pageContext?.stage) : []);
        setSearchBooks([]);
        setExcludeBooks(false);
        setSelections([pageContext?.subject ? {"subject": [itemiseTag(tags.getById(pageContext.subject as TAG_ID))]} : {}, {}, {}]);
        setSearchStatuses(
            {
                notAttempted: false,
                complete: false,
                tryAgain: false,
            });
        setSearchDisabled(!searchQuery);
    }, [isSolitaryStage, pageContext, searchQuery]);

    const debouncedSearchHandler = useMemo(() =>
        debounce((searchTerm: string) => {
            setSearchQuery(searchTerm);
        }, 500),
    [setSearchQuery]);

    const pageHelp = siteSpecific(<span>
        You can find a question by selecting the areas of interest, stage and difficulties.
        <br/>
        You can select more than one entry in each area.
    </span>, undefined);

    const metaDescription = siteSpecific(
        "Find physics, maths, chemistry and biology questions by topic and difficulty.",
        "Search for the perfect computer science questions to study. For revision. For homework. For the classroom."
    );

    const loadingPlaceholder = <div className="w-100 text-center pb-2">
        <h2 aria-hidden="true" className="pt-5">Searching...</h2>
        <IsaacSpinner />
    </div>;

    function removeFilterTag(filter: string) {
        if (searchStages.includes(filter as STAGE)) {
            setSearchStages(searchStages.filter(f => f !== filter));
        } else if (getChoiceTreeLeaves(selections).some(leaf => leaf.value === filter)) {
            setSelections(pruneTreeNode(selections, filter, true, pageContext));
        } else if (searchDifficulties.includes(filter as Difficulty)) {
            setSearchDifficulties(searchDifficulties.filter(f => f !== filter));
        } else if (searchExamBoards.includes(filter as ExamBoard)) {
            setSearchExamBoards(searchExamBoards.filter(f => f !== filter));
        } else if (searchBooks.includes(filter)) {
            setSearchBooks(searchBooks.filter(f => f !== filter));
        } else if (searchStatuses[filter as keyof QuestionStatus]) {
            setSearchStatuses({...searchStatuses, [filter as keyof QuestionStatus]: false});
        } else if (excludeBooks && filter === "excludeBooks") {
            setExcludeBooks(false);
        }
    };

    const FilterTag = ({tag}: {tag: {value: string, label: string}}) => {
        return (
            <div data-bs-theme="neutral" data-testid={`filter-tag-${tag.value}`} className="filter-tag me-2 mt-1 d-flex align-items-center">
                {tag.label}
                <button className="icon icon-close" onClick={() => removeFilterTag(tag.value)} aria-label="Close"/>
            </div>
        );
    };

    const FilterSummary = () => {
        const stageList: STAGE[] = searchStages.filter(stage => isSolitaryStage ? !pageStageToSearchStage(pageContext?.stage).includes(stage) : true);
        const selectionList: Item<TAG_ID>[] = getChoiceTreeLeaves(selections).filter(leaf => leaf.value !== pageContext?.subject);
        const statusList: string[] = Object.keys(searchStatuses).filter(status => searchStatuses[status as keyof QuestionStatus]);
        const booksList: BookInfo[] = ISAAC_BOOKS.filter(book => searchBooks.includes(book.tag));

        const categories = [
            searchDifficulties.map(d => {return {value: d, label: simpleDifficultyLabelMap[d]};}),
            stageList.map(s => {return {value: s, label: stageLabelMap[s]};}),
            statusList.map(s => {return {value: s, label: s.replace("notAttempted", "Not started").replace("complete", "Fully correct").replace("tryAgain", "In progress")};}),
            excludeBooks ? [{value: "excludeBooks", label: "Exclude skills books questions"}] : booksList.map(book => {return {value: book.tag, label: book.shortTitle};}),
            selectionList,
        ].flat();

        return <div className="d-flex flex-wrap mt-2">
            {categories.map(c => <FilterTag key={c.value} tag={c}/>)}
            {categories.length > 0 ?
                <button className="text-black py-0 btn-link bg-transparent" onClick={(e) => { e.stopPropagation(); clearFilters(); }}>
                    Clear all filters
                </button>
                : <div/>}
        </div>;
    };
    
    const crumb = isPhy && isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    const BrowseAllButton = (pageContext?.subject && pageContext.stage) && 
        <AffixButton color="keyline" tag={Link} to="/questions" className={classNames("ms-auto mw-max-content", {"btn-lg": below["md"](deviceSize), "btn-md": above["lg"](deviceSize)})}
            affix={{
                affix: "icon-arrow-right",
                position: "suffix",
                type: "icon"
            }}>
            Browse all questions
        </AffixButton>;

    return <Container id="finder-page" className={classNames("mb-5")} { ...(pageContext?.subject && { "data-bs-theme" : pageContext.subject })}>
        <TitleAndBreadcrumb 
            currentPageTitle={siteSpecific("Question Finder", "Questions")} 
            help={pageHelp}
            intermediateCrumbs={crumb ? [crumb] : []} 
            icon={{type: "hex", icon: "icon-finder"}}
        />

        <SidebarLayout>
            <QuestionFinderSidebar 
                searchText={searchQuery} setSearchText={debouncedSearchHandler}
                questionFinderFilterPanelProps={{
                    searchDifficulties, setSearchDifficulties,
                    searchTopics, setSearchTopics,
                    searchStages, setSearchStages,
                    searchExamBoards, setSearchExamBoards,
                    searchStatuses, setSearchStatuses,
                    searchBooks, setSearchBooks,
                    excludeBooks, setExcludeBooks,
                    choices, 
                    selections, setSelections,
                    applyFilters: searchAndUpdateURL, clearFilters,
                    validFiltersSelected, searchDisabled, setSearchDisabled
                }} optionBar={BrowseAllButton}/>
            <MainContent>
                <MetaDescription description={metaDescription}/>
                <CanonicalHrefElement/>

                {siteSpecific(
                    <div className="my-3">
                        {(pageContext?.subject && pageContext.stage)
                            ? <div className="d-flex align-items-start flex-wrap flex-md-nowrap flex-lg-wrap flex-xl-nowrap">
                                <p className="me-0 me-lg-3">The questions shown on this page have been filtered to only show those that are relevant to {getHumanContext(pageContext)}.</p>
                                {above["lg"](deviceSize) && BrowseAllButton}
                            </div>
                            : <>Use our question finder to find questions to try on topics in Physics, Maths, Chemistry and Biology.
                              Use our practice questions to become fluent in topics and then take your understanding and problem solving skills to the next level with our challenge questions.</>}
                    </div>,
                    <PageFragment fragmentId={"question_finder_intro"} ifNotFound={RenderNothing} />
                )}

                {isAda && <Row>
                    <Col lg={6} md={12} xs={12} className="finder-search">
                        <Label htmlFor="question-search-title" className="mt-2"><b>Search for a question</b></Label>
                        <SearchInputWithIcon
                            defaultValue={searchQuery}
                            placeholder={siteSpecific(`e.g. ${getQuestionPlaceholder(pageContext)}`, "e.g. Creating an AST")}
                            onChange={(e) => {
                                debouncedSearchHandler(e.target.value);
                                setRandomSeed(undefined); // This random seed reset is for Ada only! This is managed in the filtersChanged useEffect for Phy
                            }}
                            onSearch={searchAndUpdateURL}
                        />
                    </Col>
                </Row>}

                {isPhy && <FilterSummary/>}

                <Row className={classNames(siteSpecific("mt-2", "mt-4"), "position-relative finder-panel")}>
                    {isAda && <Col lg={3} md={12} xs={12} className={classNames("text-wrap my-2")}>
                        <QuestionFinderFilterPanel {...{
                            searchDifficulties, setSearchDifficulties,
                            searchTopics, setSearchTopics,
                            searchStages, setSearchStages,
                            searchExamBoards, setSearchExamBoards,
                            searchStatuses, setSearchStatuses,
                            searchBooks, setSearchBooks,
                            excludeBooks, setExcludeBooks,
                            choices, 
                            selections, setSelections,
                            applyFilters: () => {
                                if (isDefined(randomSeed)) {
                                    // on Ada, if randomSeed is defined, we need to unset it before running the search.
                                    // since it is state, running this first won't necessarily have it updated when searchAndUpdateURL is called.
                                    // as such, a useEffect above with randomSeed as a dep will run searchAndUpdateURL for us, instead of here.
                                    setRandomSeed(undefined);
                                } else {
                                    searchAndUpdateURL();
                                }
                            },
                            clearFilters,
                            validFiltersSelected, searchDisabled, setSearchDisabled
                        }} />
                    </Col>}
                    <Col lg={siteSpecific(12, 9)} md={12} xs={12} className="text-wrap my-2" data-testid="question-finder-results">
                        <Card>
                            <CardHeader className="finder-header pl-3">
                                <Row className="flex-grow-1">
                                    <Col>
                                        {displayQuestions && displayQuestions.length > 0
                                            ? <>Showing <b>{displayQuestions.length}</b></>
                                            : <>No results</>}
                                        {(totalQuestions ?? 0) > 0 && !filteringByStatus && <> of <b>{totalQuestions}</b></>}
                                        .
                                    </Col>
                                    <Col>                                        
                                        <button className={siteSpecific(
                                            "btn btn-link mt-0 invert-underline d-flex align-items-center gap-2 float-end",
                                            "text-black pe-lg-0 py-0 p-0 me-lg-0 bg-opacity-10 btn-link bg-white float-end")
                                        } onClick={() => setRandomSeed(nextSeed())}>
                                                Shuffle questions
                                            {isPhy && <i className="icon icon-refresh icon-color-black"></i>}
                                        </button>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody className={classNames({"border-0": isPhy, "p-0": displayQuestions?.length, "m-0": isAda && displayQuestions?.length})}>
                                <ShowLoading until={displayQuestions} placeholder={loadingPlaceholder}>
                                    {displayQuestions?.length
                                        ? isPhy 
                                            ? <ListView type="item" items={displayQuestions} /> 
                                            : <LinkToContentSummaryList 
                                                items={displayQuestions} className="m-0" 
                                                contentTypeVisibility={ContentTypeVisibility.ICON_ONLY} 
                                                ignoreIntendedAudience noCaret 
                                            />
                                        : isCurrentSearchEmpty
                                            ? filteringByStatus
                                                ? <em>Please select more filters</em>
                                                : <em>Please select and apply filters</em>
                                            : filteringByStatus 
                                                ? <em>Expecting results? Try narrowing down your filters</em>
                                                : <em>No results match your criteria</em>
                                    }
                                </ShowLoading>
                            </CardBody>
                        </Card>
                        {(displayQuestions?.length ?? 0) > 0 &&
                            <Row className="pt-3">
                                <Col className="d-flex justify-content-center mb-3">
                                    <Button
                                        onClick={() => {
                                            debouncedSearch({
                                                searchQuery, 
                                                searchTopics,
                                                searchExamBoards,
                                                searchBooks, 
                                                searchStages,
                                                searchDifficulties,
                                                selections,
                                                excludeBooks,
                                                searchStatuses,
                                                startIndex: nextSearchOffset
                                                    ? nextSearchOffset - 1
                                                    : 0,
                                                randomSeed
                                            });
                                            setPageCount(c => c + 1);
                                            setDisableLoadMore(true);
                                        }}
                                        disabled={disableLoadMore}
                                        outline={isAda}
                                    >
                                        Load more
                                    </Button>
                                </Col>
                            </Row>}
                    </Col>
                </Row>
            </MainContent>
        </SidebarLayout>
    </Container>;
});
