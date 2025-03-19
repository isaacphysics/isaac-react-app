import React, {ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {AppState, clearQuestionSearch, searchQuestions, useAppDispatch, useAppSelector} from "../../state";
import debounce from "lodash/debounce";
import {
    arrayFromPossibleCsv,
    BookInfo,
    difficultyShortLabelMap,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    getFilteredExamBoardOptions,
    getHumanContext,
    HUMAN_STAGES,
    ISAAC_BOOKS,
    isAda,
    isFullyDefinedContext,
    isLoggedIn,
    isPhy,
    Item,
    itemiseTag,
    LearningStage,
    ListParams,
    nextSeed,
    SEARCH_CHAR_LENGTH_LIMIT,
    SEARCH_RESULTS_PER_PAGE,
    simpleDifficultyLabelMap,
    siteSpecific,
    STAGE,
    STAGE_NULL_OPTIONS,
    stageLabelMap,
    TAG_ID,
    TAG_LEVEL,
    tags,
    toSimpleCSV,
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
import {Button, Card, CardBody, CardHeader, Col, Container, Input, InputGroup, Label, Row} from "reactstrap";
import {ChoiceTree, getChoiceTreeLeaves, QuestionFinderFilterPanel} from "../elements/panels/QuestionFinderFilterPanel";
import {Tier, TierID} from "../elements/svg/HierarchyFilter";
import { MainContent, QuestionFinderSidebar, SidebarLayout } from "../elements/layout/SidebarLayout";
import { PageContextState, Tag } from "../../../IsaacAppTypes";
import { PrintButton } from "../elements/PrintButton";
import { ShareLink } from "../elements/ShareLink";
import { Spacer } from "../elements/Spacer";
import { ListView } from "../elements/list-groups/ListView";
import { ContentTypeVisibility, LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { PageFragment } from "../elements/PageFragment";
import { RenderNothing } from "../elements/RenderNothing";

// Type is used to ensure that we check all query params if a new one is added in the future
const FILTER_PARAMS = ["query", "topics", "fields", "subjects", "stages", "difficulties", "examBoards", "book", "excludeBooks", "statuses"] as const;
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

function processTagHierarchy(subjects: string[], fields: string[], topics: string[]): ChoiceTree[] {
    const tagHierarchy = tags.getTagHierarchy();
    const selectionItems: ChoiceTree[] = [];

    [subjects, fields, topics].forEach((tier, index) => {
        if (tier.length > 0) {
            const validTierTags = tags.getSpecifiedTags(
                tagHierarchy[index], tier as TAG_ID[]
            );

            if (index === 0)
                selectionItems.push({[TAG_LEVEL.subject]: validTierTags.map(itemiseTag)} as ChoiceTree);
            else {
                const parents = selectionItems[index-1] ? Object.values(selectionItems[index-1]).flat() : [];
                const validChildren = parents.map(p => tags.getChildren(p.value).filter(c => tier.includes(c.id)).map(itemiseTag));

                const currentLayer: ChoiceTree = {};
                parents.forEach((p, i) => {
                    currentLayer[p.value] = validChildren[i];
                });
                selectionItems.push(currentLayer);
            }
        }
    });

    return selectionItems;
}

export function pruneTreeNode(tree: ChoiceTree[], filter: string, recursive?: boolean, pageContext?: PageContextState): ChoiceTree[] {
    let newTree = [...tree];
    newTree.forEach((tier, i) => {
        if (tier[filter as TAG_ID]) { // removing children of node
            Object.values(tier[filter as TAG_ID] || {}).forEach(v => pruneTreeNode(newTree, v.value, recursive, pageContext));
            delete newTree[i][filter as TAG_ID];
        } else { // removing node itself
            const parents = Object.keys(tier);
            parents.forEach(parent => {
                if (newTree[i][parent as TAG_ID]?.some(c => c.value === filter)) {
                    newTree[i][parent as TAG_ID] = newTree[i][parent as TAG_ID]?.filter(c => c.value !== filter);
                    if (recursive && newTree[i][parent as TAG_ID]?.length === 0 && parent !== pageContext?.subject) {
                        newTree = pruneTreeNode(newTree, parent, true, pageContext);
                    }
                }
            });
        }
    });

    return newTree;
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
    const isSolitaryStage = pageStageToSearchStage(pageContext?.stage).length === 1;

    const [searchTopics, setSearchTopics] = useState<string[]>(arrayFromPossibleCsv(params.topics));
    const [searchQuery, setSearchQuery] = useState<string>(params.query ? (params.query instanceof Array ? params.query[0] : params.query) : "");
    const [searchStages, setSearchStages] = useState<STAGE[]>(arrayFromPossibleCsv(params.stages).concat(isSolitaryStage ? pageStageToSearchStage(pageContext?.stage)[0] : []) as STAGE[]);
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>(arrayFromPossibleCsv(params.difficulties) as Difficulty[]);
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>(arrayFromPossibleCsv(params.examBoards) as ExamBoard[]);
    const [searchStatuses, setSearchStatuses] = useState<QuestionStatus>(getInitialQuestionStatuses(params));
    const [searchBooks, setSearchBooks] = useState<string[]>(arrayFromPossibleCsv(params.book));
    const [excludeBooks, setExcludeBooks] = useState<boolean>(!!params.excludeBooks);
    const [searchDisabled, setSearchDisabled] = useState(true);
    const [randomSeed, setRandomSeed] = useState<number | undefined>();
    
    const [populatedFromAccountSettings, setPopulatedFromAccountSettings] = useState(false);
    useEffect(function populateFiltersFromAccountSettings() {
        if (isLoggedIn(user)) {
            const filtersHaveNotBeenSpecifiedByQueryParams = FILTER_PARAMS.every(p => !params[p]);
            if (filtersHaveNotBeenSpecifiedByQueryParams) {
                const accountStages = user.registeredContexts?.map(c => c.stage).filter(s => s) as STAGE[];
                const allStagesSelected = accountStages?.some(stage => STAGE_NULL_OPTIONS.includes(stage));
                if (!allStagesSelected && (isPhy || accountStages.length === 1)) { // Ada only want to apply stages filter if there is only one
                    setSearchStages(accountStages);
                    setPopulatedFromAccountSettings(true);
                }
                const examBoardStages = user.registeredContexts?.map(c => c.examBoard).filter(e => e) as EXAM_BOARD[];
                const allExamBoardsSelected = examBoardStages?.some(examBoard => EXAM_BOARD_NULL_OPTIONS.includes(examBoard));
                if (isAda && !allExamBoardsSelected && examBoardStages.length === 1) { // Phy does not have exam boards
                    setSearchExamBoards(examBoardStages);
                    setPopulatedFromAccountSettings(true);
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this to re-run on params change.
    }, [user]);

    // this acts as an "on complete load", needed as we can only correctly update the URL once we have the user context *and* React has processed the above setStates
    useEffect(() => {
        searchAndUpdateURL();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [populatedFromAccountSettings]);

    const [disableLoadMore, setDisableLoadMore] = useState(false);

    const [selections, setSelections] = useState<ChoiceTree[]>(
        processTagHierarchy(
            arrayFromPossibleCsv(params.subjects).concat(pageContext?.subject ? [pageContext.subject] : []), 
            arrayFromPossibleCsv(params.fields), 
            arrayFromPossibleCsv(params.topics))  
    );

    const choices: ChoiceTree[] = [];
    if (!pageContext?.subject) {
        choices.push({"subject": tags.allSubjectTags.map(itemiseTag)});
    } else {
        choices.push({});
        choices[0][pageContext.subject] = tags.getChildren(pageContext.subject as TAG_ID).map(itemiseTag);
    }

    for (let tierIndex = 0; tierIndex < selections.length && tierIndex < 2; tierIndex++)  {
        if (Object.keys(selections[tierIndex]).length > 0) {
            choices[tierIndex+1] = {};
            for (const v of Object.values(selections[tierIndex])) {
                for (const v2 of v) 
                    choices[tierIndex+1][v2.value] = tags.getChildren(v2.value).map(itemiseTag);
            }
        }
    }

    const tiers: Tier[] = [
        {id: "subjects" as TierID, name: "Subject"},
        {id: "fields" as TierID, name: "Field"},
        {id: "topics" as TierID, name: "Topic"}
    ].map(tier => ({...tier, for: "for_" + tier.id}));

    const {results: questions, totalResults: totalQuestions, nextSearchOffset} = useAppSelector((state: AppState) => state && state.questionSearchResult) || {};
    const nothingToSearchFor =
        [searchQuery, searchTopics, searchBooks, searchStages, searchDifficulties, searchExamBoards].every(v => v.length === 0) &&
        selections.every(v => Object.keys(v).length === 0);

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], examBoards: string[],
            book: string[], stages: string[], difficulties: string[],
            hierarchySelections: ChoiceTree[],
            excludeBooks: boolean, questionStatuses: QuestionStatus,
            startIndex: number, randomSeed?: number) => {
            if (nothingToSearchFor) {
                dispatch(clearQuestionSearch);
                return;
            }

            const filterParams: Record<TierID, string[] | undefined> = {} as Record<TierID, string[] | undefined>;
            if (isPhy) {
                if (getChoiceTreeLeaves(hierarchySelections).map(leaf => leaf.value).length === 0) {
                    filterParams.subjects = [TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology];
                }
            } else {
                filterParams.topics = [...topics].filter((query) => query != "");
            }

            dispatch(searchQuestions({
                searchString: searchString,
                tags: getChoiceTreeLeaves(hierarchySelections).map(leaf => leaf.value).join(",") || undefined,
                fields: filterParams.fields?.join(",") || undefined,
                subjects: filterParams.subjects?.join(",") || undefined,
                topics: filterParams.topics?.join(",") || undefined,
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
        [nothingToSearchFor]
    );

    const [filteringByStatus, setFilteringByStatus] = useState<boolean>(
        !( Object.values(searchStatuses).every(v => v) || Object.values(searchStatuses).every(v => !v) )
    );

    const [noResultsMessage, setNoResultsMessage] = useState<ReactNode>(<em>Please select and apply filters</em>);

    const applyFilters = () => {
        // Have to use a local variable as React won't update state in time
        const isFilteringByStatus = !(
            Object.values(searchStatuses).every(v => v) || Object.values(searchStatuses).every(v => !v)
        );

        if (nothingToSearchFor) {
            if (isFilteringByStatus) {
                setNoResultsMessage(<em>Please select more filters</em>);
            } else {
                setNoResultsMessage(<em>Please select and apply filters</em>);
            }
        } else if (isFilteringByStatus) {
            setNoResultsMessage(<em>Expecting results? Try narrowing down your filters</em>);
        } else {
            setNoResultsMessage(<em>No results match your criteria</em>);
        }

        setFilteringByStatus(isFilteringByStatus);
        setRandomSeed(undefined);
        searchAndUpdateURL();
    };

    const searchAndUpdateURL = useCallback(() => {
        setPageCount(1);
        setDisableLoadMore(false);
        setDisplayQuestions(undefined);

        const filteredStages = !searchStages.length && pageContext?.stage ? pageStageToSearchStage(pageContext.stage) : searchStages;
        searchDebounce(
            searchQuery, searchTopics, searchExamBoards, searchBooks, filteredStages,
            searchDifficulties, selections, excludeBooks, searchStatuses, 0, randomSeed
        );

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
            tiers.forEach((tier, i) => {
                if (!selections[i] || Object.keys(selections[i]).length === 0) {
                    return;
                }
                params[tier.id] = Object.values(selections[i])
                    .flat().map(item => item.value)
                    .filter(v => v !== pageContext?.subject).join(",");
                if (params[tier.id] === "") delete params[tier.id];
            });
        }
        if (randomSeed !== undefined) params.randomSeed = randomSeed.toString();

        history.replace({search: queryString.stringify(params, {encode: false}), state: location.state});
    }, [searchDebounce, searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages, searchDifficulties, selections, tiers, excludeBooks, searchStatuses, filteringByStatus]);

    // Automatically search for content whenever the searchQuery changes, without changing whether filters have been applied or not
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(searchAndUpdateURL, [searchQuery, randomSeed]);

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

    useEffect(() => {
        setSearchDisabled(false);
        setValidFiltersSelected(searchDifficulties.length > 0
            || searchTopics.length > 0
            || searchExamBoards.length > 0
            || searchStages.length > 0
            || searchBooks.length > 0
            || excludeBooks
            || selections.some(tier => Object.values(tier).flat().length > 0)
            || Object.entries(searchStatuses).some(e => e[1]));
        if (isPhy) applyFilters();
    }, [searchDifficulties, searchTopics, searchExamBoards, searchStages, searchBooks, excludeBooks, selections, searchStatuses]);

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
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSearch = useCallback(
        debounce((searchTerm: string) => {
            setSearchQuery(searchTerm);
        }, 500),
        [setSearchQuery]
    );

    const pageHelp = siteSpecific(<span>
        You can find a question by selecting the areas of interest, stage and difficulties.
        <br/>
        You can select more than one entry in each area.
    </span>, undefined);

    const description = siteSpecific(
        (pageContext?.subject && pageContext.stage ? `Use our question finder to find questions to try on ${getHumanContext(pageContext)} topics.` : "Use our question finder to find questions to try on topics in Physics, Maths, Chemistry and Biology.") 
        + " Use our practice questions to become fluent in topics and then take your understanding and problem solving skills to the next level with our challenge questions.",
        "");

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
            <div data-bs-theme="neutral" className="filter-tag me-2 mt-1 d-flex align-items-center">
                {tag.label}
                <button className="icon icon-close" onClick={() => removeFilterTag(tag.value)} aria-label="Close"/>
            </div>
        );
    };

    const FilterSummary = () => {
        const stageList: STAGE[] = searchStages.filter(stage => isSolitaryStage ? !pageStageToSearchStage(pageContext?.stage).includes(stage) : true);
        const selectionList: Item<TAG_ID>[] = getChoiceTreeLeaves(selections).filter(leaf => leaf.value !== pageContext?.subject);
        const statusList: string[] = Object.keys(searchStatuses).filter(status => searchStatuses[status as keyof QuestionStatus]);
        const booksList: BookInfo[] = ISAAC_BOOKS.filter(book => searchBooks.includes(book.value));

        const categories = [
            searchDifficulties.map(d => {return {value: d, label: simpleDifficultyLabelMap[d]};}),
            stageList.map(s => {return {value: s, label: stageLabelMap[s]};}),
            statusList.map(s => {return {value: s, label: s.replace("notAttempted", "Not started").replace("complete", "Fully correct").replace("tryAgain", "In progress")};}),
            excludeBooks ? [{value: "excludeBooks", label: "Exclude skills books questions"}] : booksList.map(book => {return {value: book.value, label: book.label};}),
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

    return <Container id="finder-page" className={classNames("mb-5")} { ...(pageContext?.subject && { "data-bs-theme" : pageContext.subject })}>
        <TitleAndBreadcrumb 
            currentPageTitle={siteSpecific("Question Finder", "Questions")}
            description={description} help={pageHelp}
            intermediateCrumbs={crumb ? [crumb] : []}
            icon={{type: "hex", icon: "page-icon-finder"}}
        />
        {siteSpecific(<div className="d-flex align-items-center">
            <span>Use the search box and/or filters to find questions; you can then refine your search further with the filters.</span>
            <Spacer/>
            <div className="no-print d-flex align-items-center">
                <div className="question-actions question-actions-leftmost mt-3">
                    <ShareLink linkUrl={`/questions`}/>
                </div>
                <div className="question-actions mt-3 not-mobile">
                    <PrintButton/>
                </div>
            </div>
        </div>, 
        <PageFragment fragmentId={"question_finder_intro"} ifNotFound={RenderNothing} />)}
        <SidebarLayout>
            <QuestionFinderSidebar searchText={searchQuery} setSearchText={setSearchQuery} questionFilters={[]} setQuestionFilters={function (value: React.SetStateAction<Tag[]>): void {
                throw new Error("Function not implemented.");
            } } topLevelFilters={[]} 
            questionFinderFilterPanelProps={{
                searchDifficulties, setSearchDifficulties,
                searchTopics, setSearchTopics,
                searchStages, setSearchStages,
                searchExamBoards, setSearchExamBoards,
                searchStatuses, setSearchStatuses,
                searchBooks, setSearchBooks,
                excludeBooks, setExcludeBooks,
                tiers, choices, 
                selections, setSelections,
                applyFilters, clearFilters,
                validFiltersSelected, searchDisabled, setSearchDisabled
            }} />
            <MainContent>
                <MetaDescription description={metaDescription}/>
                <CanonicalHrefElement/>

                {isAda && <Row>
                    <Col lg={6} md={12} xs={12} className="finder-search">
                        <Label htmlFor="question-search-title" className="mt-2"><b>Search for a question</b></Label>
                        <InputGroup>
                            <Input id="question-search-title"
                                type="text"
                                maxLength={SEARCH_CHAR_LENGTH_LIMIT}
                                defaultValue={searchQuery}
                                placeholder={siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST")}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Button className="question-search-button" onClick={searchAndUpdateURL}/>
                        </InputGroup>
                    </Col>
                </Row>}

                {isPhy && <FilterSummary/>}

                <Row className="mt-4 position-relative finder-panel">
                    <Col lg={siteSpecific(4, 3)} md={12} xs={12} className={classNames("text-wrap my-2", {"d-none": isPhy})} data-testid="question-finder-filters">
                        <QuestionFinderFilterPanel {...{
                            searchDifficulties, setSearchDifficulties,
                            searchTopics, setSearchTopics,
                            searchStages, setSearchStages,
                            searchExamBoards, setSearchExamBoards,
                            searchStatuses, setSearchStatuses,
                            searchBooks, setSearchBooks,
                            excludeBooks, setExcludeBooks,
                            tiers, choices, 
                            selections, setSelections,
                            applyFilters, clearFilters,
                            validFiltersSelected, searchDisabled, setSearchDisabled
                        }} /> {/* Temporarily disabled at >=lg to test list view until this filter is moved into the sidebar */}
                    </Col>
                    <Col lg={siteSpecific(12, 9)} md={12} xs={12} className="text-wrap my-2" data-testid="question-finder-results">
                        <Card>
                            <CardHeader className="finder-header pl-3">
                                <Row>
                                    <Col>
                                        {displayQuestions && displayQuestions.length > 0
                                            ? <>Showing <b>{displayQuestions.length}</b></>
                                            : <>No results</>}
                                        {(totalQuestions ?? 0) > 0 && !filteringByStatus && <> of <b>{totalQuestions}</b></>}
                                        .
                                    </Col>
                                    <Col>
                                        <button className="btn btn-link invert-underline d-flex align-items-center gap-2 float-end"
                                            onClick={() => setRandomSeed(nextSeed())}>Shuffle questions<i className="icon icon-refresh icon-color-black"></i></button>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody className={classNames({"border-0": isPhy, "p-0": displayQuestions?.length, "m-0": isAda && displayQuestions?.length})}>
                                <ShowLoading until={displayQuestions} placeholder={loadingPlaceholder}>
                                    {displayQuestions?.length ? 
                                        isPhy ? 
                                            <ListView items={displayQuestions}/> :
                                            <LinkToContentSummaryList 
                                                items={displayQuestions} className="m-0" 
                                                contentTypeVisibility={ContentTypeVisibility.ICON_ONLY} 
                                                ignoreIntendedAudience noCaret 
                                            />
                                        : noResultsMessage }
                                </ShowLoading>
                            </CardBody>
                        </Card>
                        {(displayQuestions?.length ?? 0) > 0 &&
                            <Row className="pt-3">
                                <Col className="d-flex justify-content-center mb-3">
                                    <Button
                                        onClick={() => {
                                            searchDebounce(
                                                searchQuery, searchTopics,
                                                searchExamBoards,
                                                searchBooks, searchStages,
                                                searchDifficulties,
                                                selections,
                                                excludeBooks,
                                                searchStatuses,
                                                nextSearchOffset
                                                    ? nextSearchOffset - 1
                                                    : 0,
                                                randomSeed);
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
