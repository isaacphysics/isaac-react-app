import React, {useCallback, useEffect, useMemo, useState} from "react";
import {AppState, selectors, useAppSelector, useSearchQuestionsQuery} from "../../state";
import debounce from "lodash/debounce";
import {
    arrayFromPossibleCsv,
    BookInfo,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    getAllowedTags,
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
    LEARNING_STAGE_TO_STAGES,
    LearningStage,
    ListParams,
    nextSeed,
    SEARCH_RESULTS_PER_PAGE,
    simpleDifficultyLabelMap,
    siteSpecific,
    STAGE,
    STAGE_NULL_OPTIONS,
    stageLabelMap,
    STAGES_PHY,
    SUBJECT_SPECIFIC_CHILDREN_MAP,
    TAG_ID,
    tags,
    toSimpleCSV,
    useQueryParams,
    useUrlPageTheme,
} from "../../services";
import {Difficulty, ExamBoard} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {useHistory, withRouter} from "react-router";
import {generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import classNames from "classnames";
import queryString from "query-string";
import {Button, CardBody, Col, Container, Label, Row} from "reactstrap";
import {ChoiceTree, getChoiceTreeLeaves, QuestionFinderFilterPanel} from "../elements/panels/QuestionFinderFilterPanel";
import {TierID} from "../elements/svg/HierarchyFilter";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { ListView } from "../elements/list-groups/ListView";
import { PageFragment } from "../elements/PageFragment";
import { RenderNothing } from "../elements/RenderNothing";
import { processTagHierarchy, pruneTreeNode } from "../../services/questionHierarchy";
import { SearchInputWithIcon } from "../elements/SearchInputs";
import { Link } from "react-router-dom";
import { updateTopicChoices } from "../../services";
import { PageMetadata } from "../elements/PageMetadata";
import { ResultsListContainer, ResultsListHeader } from "../elements/ListResultsContainer";
import { QuestionSearchQuery } from "../../../IsaacAppTypes";
import { skipToken } from "@reduxjs/toolkit/query";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { QuestionFinderSidebar } from "../elements/sidebar/QuestionFinderSidebar";

// Type is used to ensure that we check all query params if a new one is added in the future
const FILTER_PARAMS = ["query", "topics", "fields", "subjects", "stages", "difficulties", "examBoards", "book", "excludeBooks", "statuses", "randomSeed"] as const;
type FilterParams = typeof FILTER_PARAMS[number];

export interface QuestionStatus {
    notAttempted: boolean;
    tryAgain: boolean;
    allIncorrect: boolean; // Ada only
    allAttempted: boolean; // Phy only
    complete: boolean;
}

export const statusLabelMap: {[key: string]: string} = {
    "notAttempted": siteSpecific("Not started", "Not attempted"),
    "tryAgain": siteSpecific("In progress", "Try again"),
    "allIncorrect": "All incorrect",
    "allAttempted": "All attempted",
    "complete": siteSpecific("Fully correct", "Completed"),
};

function questionStatusToURIComponent(statuses: QuestionStatus): string {
    return Object.entries(statuses)
        .filter(e => e[1])
        .map(e => {
            switch(e[0]) {
                case "notAttempted": return "NOT_ATTEMPTED";
                case "tryAgain": return "IN_PROGRESS";
                case "allIncorrect": return "ALL_INCORRECT"; 
                case "allAttempted": return "ALL_ATTEMPTED";
                case "complete": return "ALL_CORRECT";
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
            tryAgain: false,
            allIncorrect: false,
            allAttempted: false,
            complete: false,
        };
    }
    else {
        // otherwise set use the URI components
        return {
            notAttempted: statuses.includes("notAttempted"),
            tryAgain: statuses.includes("tryAgain"),
            allIncorrect: statuses.includes("allIncorrect"),
            allAttempted: statuses.includes("allAttempted"),
            complete: statuses.includes("complete"),
        };
    }
}

export function pageStageToSearchStage(stage?: LearningStage[]): STAGE[] {
    if (!stage || stage.length === 0) return [];
    return LEARNING_STAGE_TO_STAGES[stage[0]].filter(s => (STAGES_PHY as readonly STAGE[]).includes(s));
}

interface FilterSummaryProps {
    filterTags: { value: string; label: string; }[],
    clearFilters: () => void,
    removeFilterTag: (value: string) => void
}

export const FilterSummary = ({filterTags, clearFilters, removeFilterTag}: FilterSummaryProps) => {
    const pageContext = useAppSelector(selectors.pageContext.context);
    // On GCSE & university question finders, there is only one stage which cannot be cleared
    const isUniqueStage = (tagValue: string) => {return tagValue === "gcse" || tagValue === "university";};
    const isClearable = (tagValue: string) => {return !(isUniqueStage(tagValue) && isFullyDefinedContext(pageContext));};

    return <div className="d-flex flex-wrap mt-2">
        {filterTags.map(t => <div key={t.value} data-bs-theme="neutral" data-testid={`filter-tag-${t.value}`} className="filter-tag me-2 mt-1 d-flex align-items-center">
            {t.label}
            {isClearable(t.value) && <button className="icon icon-close" onClick={() => removeFilterTag(t.value)} aria-label="Close"/>}
        </div>)}
        {filterTags.length > 0 && filterTags.some(t => isClearable(t.value)) && <button className="text-black py-0 mt-1 btn-link bg-transparent" onClick={(e) => { e.stopPropagation(); clearFilters(); }}>
            Clear all filters
        </button>}
    </div>;
};

const loadingPlaceholder = <ResultsListContainer>
    <div className="w-100 text-center pb-2">
        <h2 aria-hidden="true" className="pt-7">Searching...</h2>
        <IsaacSpinner />
    </div>
</ResultsListContainer>;

export const QuestionFinder = withRouter(() => {
    const user = useAppSelector((state: AppState) => state && state.user);
    const params = useQueryParams<FilterParams, false>(false);
    const history = useHistory();
    const pageContext = useUrlPageTheme();
    const [selections, setSelections] = useState<ChoiceTree[]>(processTagHierarchy(
        tags,
        pageContext.subject ? [pageContext.subject] : arrayFromPossibleCsv(params.subjects),
        arrayFromPossibleCsv(params.fields),
        arrayFromPossibleCsv(params.topics),
        pageContext
    ));
    const [searchTopics, setSearchTopics] = useState<string[]>(arrayFromPossibleCsv(params.topics));
    const [searchQuery, setSearchQuery] = useState<string>(params.query ? (params.query instanceof Array ? params.query[0] : params.query) : "");
    const [searchStages, setSearchStages] = useState<STAGE[]>(pageContext.stage?.length ? pageStageToSearchStage(pageContext.stage) : arrayFromPossibleCsv(params.stages) as STAGE[]); // we can't fully populate this until we have the user
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
                if (!allStagesSelected && (isPhy ? !pageContext?.stage?.length : accountStages.length === 1)) { // Ada only want to apply stages filter if there is only one
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

    const choices = useMemo(() => {
        return updateTopicChoices(selections, pageContext, getAllowedTags(pageContext));
    }, [selections, pageContext]);

    const isEmptySearch = (query: string, topics: string[], books: string[], stages: string[], difficulties: string[], examBoards: string[], selections: ChoiceTree[]) => {
        return [query, topics, books, stages, difficulties, examBoards].every(v => v.length === 0) && selections.every(v => Object.keys(v).length === 0);
    };

    const [searchParams, setSearchParams] = useState<QuestionSearchQuery | typeof skipToken>(skipToken);
    const searchQuestionsQuery = useSearchQuestionsQuery(searchParams);

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
        }): void => {
            if (isEmptySearch(searchString, topics, book, stages, difficulties, examBoards, hierarchySelections)) {
                setSearchParams(skipToken);
                return;
            }

            const choiceTreeLeaves = getChoiceTreeLeaves(hierarchySelections).map(leaf => leaf.value);
            if (hierarchySelections.length > 1 && pageContext?.subject && pageContext.stage?.length === 1) {
                SUBJECT_SPECIFIC_CHILDREN_MAP[pageContext?.subject][pageContext.stage[0]]?.forEach(tag => {
                    if (pageContext?.subject && hierarchySelections[1][pageContext.subject]?.length === 0) {
                        choiceTreeLeaves.push(tag);
                    } else if (pageContext?.subject && hierarchySelections[1][pageContext.subject]?.some((t: {value: TAG_ID}) => t.value === tag)) {
                        const index = choiceTreeLeaves.indexOf(pageContext?.subject as TAG_ID);
                        if (index > -1) {
                            choiceTreeLeaves.splice(index, 1);
                        }
                    }
                });
            }

            setSearchParams({
                querySource: "questionFinder",
                searchString: searchString || undefined,
                tags: choiceTreeLeaves.join(",") || undefined,
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
                limit: SEARCH_RESULTS_PER_PAGE,
                randomSeed
            });
        }, 250, { leading: true }),
    [pageContext]);


    const filteringByStatus = Object.values(searchStatuses).some(v => v) && !Object.values(searchStatuses).every(v => v);

    const searchAndUpdateURL = useCallback(() => {
        setPageCount(1);

        const filteredStages = !searchStages.length && pageContext?.stage ? pageStageToSearchStage(pageContext.stage) : searchStages;
        debouncedSearch({
            searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages: filteredStages,
            searchDifficulties, selections, excludeBooks, searchStatuses, startIndex: 0, randomSeed
        });

        if (!selections.length) return;
        setReadingFromUrlParams(false);

        const params: {[key: string]: string} = {};
        if (searchStages.length) {
            params.stages = toSimpleCSV(searchStages);
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
    }, [searchStages, pageContext, debouncedSearch, searchQuery, searchTopics, searchExamBoards, searchBooks, searchDifficulties, selections, excludeBooks, searchStatuses, filteringByStatus, history, randomSeed]);

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

    const [pageCount, setPageCount] = useState(1);

    const [validFiltersSelected, setValidFiltersSelected] = useState(false);

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

    }, [searchDifficulties, searchTopics, searchExamBoards, searchStages, searchBooks, excludeBooks, selections, searchStatuses]);

    const clearFilters = useCallback(() => {
        setSearchDifficulties([]);
        setSearchTopics([]);
        setSearchExamBoards([]);
        setSearchStages([]);
        setSearchBooks([]);
        setExcludeBooks(false);
        setSelections([pageContext?.subject ? {"subject": [itemiseTag(tags.getById(pageContext.subject as TAG_ID))]} : {}, {}, {}]);
        setSearchStatuses(
            {
                tryAgain: false,
                notAttempted: false,
                allIncorrect: false,
                allAttempted: false,
                complete: false,
            });
        setSearchDisabled(!searchQuery);
    }, [pageContext, searchQuery]);

    const debouncedSearchHandler = useMemo(() =>
        debounce((searchTerm: string) => {
            setRandomSeed(undefined);
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

    const selectionList: Item<TAG_ID>[] = getChoiceTreeLeaves(selections).filter(leaf => leaf.value !== pageContext?.subject);
    const statusList: string[] = Object.keys(searchStatuses).filter(status => searchStatuses[status as keyof QuestionStatus]);
    const booksList: BookInfo[] = ISAAC_BOOKS.filter(book => searchBooks.includes(book.tag));

    const filterTags = useMemo(() => [
        searchDifficulties.map(d => {return {value: d, label: simpleDifficultyLabelMap[d]};}),
        searchStages.map(s => {return {value: s, label: stageLabelMap[s]};}),
        statusList.map(s => {return {value: s, label: statusLabelMap[s]};}),
        excludeBooks ? [{value: "excludeBooks", label: "Exclude skills books questions"}] : booksList.map(book => {return {value: book.tag, label: book.shortTitle};}),
        selectionList,
    ].flat(), [searchDifficulties, searchStages, statusList, excludeBooks, booksList, selectionList]);

    const crumb = isPhy && isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    return <Container id="finder-page" className={classNames("mb-7")} { ...(pageContext?.subject && { "data-bs-theme" : pageContext.subject })}>
        <TitleAndBreadcrumb 
            currentPageTitle={siteSpecific("Question finder", "Questions")} 
            help={pageHelp}
            intermediateCrumbs={crumb ? [crumb] : []}
            icon={{type: "icon", icon: "icon-finder"}}
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
                }} hideButton/>
            <MainContent>
                <MetaDescription description={metaDescription}/>
                <CanonicalHrefElement/>

                <PageMetadata noTitle showSidebarButton>
                    {siteSpecific(
                        <div>
                            {(pageContext?.subject && pageContext.stage)
                                ? <div className="d-flex align-items-start flex-wrap flex-md-nowrap flex-lg-wrap flex-xl-nowrap">
                                    <p className="me-0 me-lg-3">
                                        The questions shown on this page have been filtered to only show those that are relevant to {getHumanContext(pageContext)}.
                                        You can browse all questions <Link to="/questions">here</Link>.
                                    </p>
                                </div>
                                : <>Use our question finder to find questions to try on topics in Physics, Maths, Chemistry and Biology.
                                    Use our practice questions to become fluent in topics and then take your understanding and problem solving skills to the next level with our challenge questions.</>}
                        </div>,
                        <PageFragment fragmentId={"question_finder_intro"} ifNotFound={RenderNothing} />
                    )}
                </PageMetadata>


                {isAda && <Row>
                    <Col lg={6} md={12} xs={12} className="finder-search">
                        <Label htmlFor="question-search-title" className="mt-2"><b>Search for a question</b></Label>
                        <SearchInputWithIcon
                            defaultValue={searchQuery}
                            placeholder={siteSpecific(`e.g. ${getQuestionPlaceholder(pageContext)}`, "e.g. Creating an AST")}
                            onChange={(e) => debouncedSearchHandler(e.target.value)}
                            onSearch={searchAndUpdateURL}
                        />
                    </Col>
                </Row>}

                {isPhy && <FilterSummary filterTags={filterTags} removeFilterTag={removeFilterTag} clearFilters={clearFilters}/>}

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
                        <ShowLoadingQuery 
                            query={searchQuestionsQuery} 
                            placeholder={loadingPlaceholder}
                            defaultErrorTitle="Error loading questions"
                            uninitializedPlaceholder={
                                <ResultsListContainer>
                                    <ResultsListHeader className="d-flex">
                                        {siteSpecific(
                                            <>Select {filteringByStatus ? "more" : "some"} filters to start searching.</>,
                                            <span>Please select and apply filters.</span>
                                        )}
                                    </ResultsListHeader>
                                </ResultsListContainer>
                            }
                            maintainOnRefetch={pageCount > 1}
                            thenRender={({ results: questions, totalResults: totalQuestions, nextSearchOffset, moreResultsAvailable }, isStale) => {
                                return <>
                                    <ResultsListContainer>
                                        <ResultsListHeader className="d-flex">
                                            <div className="flex-grow-1" data-testid="question-finder-results-header">
                                                {questions && questions.length > 0 
                                                    ? <>
                                                        Showing <b>{questions.length}</b>
                                                        {(totalQuestions ?? 0) > 0 && !filteringByStatus && <> of <b>{totalQuestions}</b></>}
                                                        .
                                                    </>
                                                    : isPhy && <>No results.</>
                                                }
                                            </div>
                                            <button 
                                                className={siteSpecific(
                                                    "btn btn-link mt-0 invert-underline d-flex align-items-center gap-2 float-end ms-3 text-nowrap",
                                                    "text-black pe-lg-0 py-0 p-0 me-lg-0 bg-opacity-10 btn-link bg-white float-end")
                                                } 
                                                onClick={() => setRandomSeed(nextSeed())}
                                                disabled={questions?.length === 0}
                                            >
                                                <span>Shuffle <span className="d-none d-sm-inline">questions</span></span>
                                                {isPhy && <i className={classNames("icon icon-refresh", questions?.length === 0 ? "icon-color-grey" : "icon-color-black")}></i>}
                                            </button>
                                        </ResultsListHeader>
                                        <CardBody className={classNames({"border-0": isPhy, "p-0": questions?.length, "m-0": isAda && questions?.length})}>
                                            {questions?.length
                                                ? <ListView type="item" items={questions} hideIconLabel/>
                                                : isAda && (filteringByStatus 
                                                    ? <span>Could not load any results matching the requested filters.</span>
                                                    : <span>No results match the requested filters.</span>
                                                )
                                            }
                                        </CardBody>
                                    </ResultsListContainer>
                                    {(questions?.length ?? 0) > 0 &&
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
                                                            startIndex: nextSearchOffset ? nextSearchOffset - 1 : 0,
                                                            randomSeed
                                                        });
                                                        setPageCount(c => c + 1);
                                                    }}
                                                    disabled={!moreResultsAvailable || isStale}
                                                    outline={isAda}
                                                >
                                                    Load more
                                                </Button>
                                            </Col>
                                        </Row>
                                    }
                                </>;
                            }}
                        />
                    </Col>
                </Row>
            </MainContent>
        </SidebarLayout>
    </Container>;
});
