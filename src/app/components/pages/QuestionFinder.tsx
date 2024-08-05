import React, { useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    AppState,
    clearQuestionSearch,
    searchQuestions,
    useAppDispatch,
    useAppSelector
} from "../../state";
import debounce from "lodash/debounce";
import {
    tags,
    EXAM_BOARD_NULL_OPTIONS,
    getFilteredExamBoardOptions,
    isAda,
    isPhy,
    Item,
    logEvent,
    siteSpecific,
    STAGE,
    useUserViewingContext,
    STAGE_NULL_OPTIONS,
    useQueryParams,
    arrayFromPossibleCsv,
    toSimpleCSV,
    TAG_ID,
    itemiseTag,
    SEARCH_RESULTS_PER_PAGE,
} from "../../services";
import {ContentSummaryDTO, Difficulty, ExamBoard} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import { RouteComponentProps, useHistory, withRouter } from "react-router";
import { LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { ShowLoading } from "../handlers/ShowLoading";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { MetaDescription } from "../elements/MetaDescription";
import { CanonicalHrefElement } from "../navigation/CanonicalHrefElement";
import classNames from "classnames";
import queryString from "query-string";
import { PageFragment } from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Label, Row } from "reactstrap";
import { QuestionFinderFilterPanel } from "../elements/panels/QuestionFinderFilterPanel";
import { Tier, TierID } from "../elements/svg/HierarchyFilter";

export interface QuestionStatus {
    notAttempted: boolean;
    complete: boolean;
    incorrect: boolean;
    llmMarked: boolean;
    hideCompleted: boolean; // TODO: remove when implementing desired filters
}

function processTagHierarchy(subjects: string[], fields: string[], topics: string[]): Item<TAG_ID>[][] {
    const tagHierarchy = tags.getTagHierarchy();
    const selectionItems: Item<TAG_ID>[][] = [];

    let plausibleParentHeirarchy = true;
    [subjects, fields, topics].forEach((tier, index) => {
        if (tier && plausibleParentHeirarchy) {
            const validTierTags = tags.getSpecifiedTags(
                tagHierarchy[index], tier as TAG_ID[]
            );
            plausibleParentHeirarchy = validTierTags.length === 1;
            selectionItems.push(validTierTags.map(itemiseTag));
        }
    });

    return selectionItems;
}

export const QuestionFinder = withRouter(({location}: RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const userContext = useUserViewingContext();
    const params: {[key: string]: string | string[] | undefined} = useQueryParams(false);
    const history = useHistory();
    const eventLog = useRef<object[]>([]).current; // persist state but do not rerender on mutation

    const [searchTopics, setSearchTopics] = useState<string[]>(
        arrayFromPossibleCsv(params.topics)
    );
    const [searchQuery, setSearchQuery] = useState<string>(
        params.query ? (params.query instanceof Array ? params.query[0] : params.query) : ""
    );
    const [searchStages, setSearchStages] = useState<STAGE[]>(
        arrayFromPossibleCsv(params.stages) as STAGE[]
    );
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>(
        arrayFromPossibleCsv(params.difficulties) as Difficulty[]
    );
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>(
        arrayFromPossibleCsv(params.examBoards) as ExamBoard[]
    );
    const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus>(
        {
            notAttempted: false,
            complete: false,
            incorrect: false,
            llmMarked: false,
            hideCompleted: !!params.hideCompleted
        }
    );

    useEffect(function populateExamBoardFromUserContext() {
        if (!EXAM_BOARD_NULL_OPTIONS.includes(userContext.examBoard)) {
            setSearchExamBoards(arr => arr.length > 0 ? arr : [userContext.examBoard]);
        }
    }, [userContext.examBoard]);

    useEffect(function populateStageFromUserContext() {
        if (!STAGE_NULL_OPTIONS.includes(userContext.stage)) {
            setSearchStages(arr => arr.length > 0 ? arr : [userContext.stage]);
        }
    }, [userContext.stage]);

    const [searchBooks, setSearchBooks] = useState<string[]>(arrayFromPossibleCsv(params.book));
    const [excludeBooks, setExcludeBooks] = useState<boolean>(!!params.excludeBooks);
    const [disableLoadMore, setDisableLoadMore] = useState(false);

    const subjects = arrayFromPossibleCsv(params.subjects);
    const fields = arrayFromPossibleCsv(params.fields);
    const topics = arrayFromPossibleCsv(params.topics);
    const [selections, setSelections] = useState<Item<TAG_ID>[][]>(
        processTagHierarchy(subjects, fields, topics)
    );

    const choices = [tags.allSubjectTags.map(itemiseTag)];
    let index;
    for (index = 0; index < selections.length && index < 2; index++)  {
        const selection = selections[index];
        if (selection.length !== 1) break;
        choices.push(tags.getChildren(selection[0].value).map(itemiseTag));
    }

    const tiers: Tier[] = [
        {id: "subjects" as TierID, name: "Subject"},
        {id: "fields" as TierID, name: "Field"},
        {id: "topics" as TierID, name: "Topic"}
    ].map(tier => ({...tier, for: "for_" + tier.id})).slice(0, index + 1);

    const setTierSelection = (tierIndex: number) => {
        return ((values: Item<TAG_ID>[]) => {
            const newSelections = selections.slice(0, tierIndex);
            newSelections.push(values);
            setSelections(newSelections);
        }) as React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>;
    };

    const {results: questions, totalResults: totalQuestions, nextSearchOffset} = useAppSelector((state: AppState) => state && state.questionSearchResult) || {};
    const nothingToSearchFor =
        [searchQuery, searchTopics, searchBooks, searchStages, searchDifficulties, searchExamBoards].every(v => v.length === 0) &&
        selections.every(v => v.length === 0);

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], hierarchySelections: Item<TAG_ID>[][], tiers: Tier[], excludeBooks: boolean, hideCompleted: boolean, startIndex: number) => {
            if (nothingToSearchFor) {
                dispatch(clearQuestionSearch);
                return;
            }

            const filterParams: Record<TierID, string[] | undefined> = {} as Record<TierID, string[] | undefined>;
            if (isPhy) {
                const allTags: TAG_ID[] = [TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology];
                tiers.forEach((tier, i) => {
                    if (!hierarchySelections[i] || hierarchySelections[i].length === 0) {
                        if (i === 0) {
                            filterParams[tier.id] = allTags;
                        }
                        return;
                    }
                    filterParams[tier.id] = hierarchySelections[i].map(item => item.value);
                });
            } else {
                filterParams["topics"] = [...topics].filter((query) => query != "");
            }
            const examBoardString = examBoards.join(",");

            dispatch(searchQuestions({
                searchString: searchString,
                tags: "", // Tags currently not used
                fields: filterParams.fields?.join(",") || undefined,
                subjects: filterParams.subjects?.join(",") || undefined,
                topics: filterParams.topics?.join(",") || undefined,
                books: (!excludeBooks && book.join(",")) || undefined,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoardString,
                questionCategories: isPhy
                    ? (excludeBooks ? "problem_solving" : "problem_solving,book")
                    : undefined,
                fasttrack: false,
                hideCompleted,
                startIndex,
                limit: SEARCH_RESULTS_PER_PAGE + 1 // request one more than we need, as to know if there are more results
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, examBoards, book, stages, difficulties, startIndex});
        }, 250),
        []
    );

    useEffect(() => {
        // If a certain stage excludes a selected examboard remove it from query params
        if (isAda) {
            setSearchExamBoards(
                getFilteredExamBoardOptions({byStages: searchStages})
                    .filter(o => searchExamBoards.includes(o.value))
                    .map(o => o.value)
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchStages]);

    const searchAndUpdateURL = () => {
        setPageCount(1);
        setDisableLoadMore(false);
        setDisplayQuestions(undefined);
        searchDebounce(
            searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages,
            searchDifficulties, selections, tiers, excludeBooks, questionStatuses.hideCompleted, 0);

        const params: {[key: string]: string} = {};
        if (searchStages.length) params.stages = toSimpleCSV(searchStages);
        if (searchDifficulties.length) params.difficulties = toSimpleCSV(searchDifficulties);
        if (searchQuery.length) params.query = encodeURIComponent(searchQuery);
        if (isAda && searchTopics.length) params.topics = toSimpleCSV(searchTopics);
        if (isAda && searchExamBoards.length) params.examBoards = toSimpleCSV(searchExamBoards);
        if (isPhy && !excludeBooks && searchBooks.length) {
            params.book = toSimpleCSV(searchBooks);
        }
        if (isPhy && excludeBooks) params.excludeBooks = "set";
        if (questionStatuses.hideCompleted) params.hideCompleted = "set";

        if (isPhy) {
            tiers.forEach((tier, i) => {
                if (!selections[i] || selections[i].length === 0) {
                    return;
                }
                params[tier.id] = selections[i].map(item => item.value).join(",");
            });
        }

        history.replace({search: queryString.stringify(params, {encode: false}), state: location.state});
    };

    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
    const applyFilters = () => {
        setFiltersApplied(true);
        searchAndUpdateURL();
    };

    // search for content whenever the searchQuery changes
    // but do not change whether filters have been applied or not
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(searchAndUpdateURL, [searchQuery]);

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

    useEffect(() => {
        if (displayQuestions && nextSearchOffset && pageCount > 1) {
            setDisplayQuestions(dqs => [...dqs ?? [], ...questionList ?? []]);
        } else {
            setDisplayQuestions(questionList);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionList]);

    const filtersSelected = useMemo(() => {
        setFiltersApplied(false);
        return searchDifficulties.length > 0
            || searchTopics.length > 0
            || searchExamBoards.length > 0
            || searchStages.length > 0
            || searchBooks.length > 0
            || selections.some(tier => tier.length > 0)
            || Object.entries(questionStatuses)
                .filter(e => e[0] !== "revisionMode"
                        && e[0] !== "hideCompleted") // Ignore revision mode as it isn't really a filter
                .some(e => e[1]);
    }, [questionStatuses, searchBooks, searchDifficulties, searchExamBoards, searchStages, searchTopics, selections]);

    const clearFilters = () => {
        setSearchDifficulties([]);
        setSearchTopics([]);
        setSearchExamBoards([]);
        setSearchStages([]);
        setSearchBooks([]);
        setExcludeBooks(false);
        setSelections([[], [], []]);
        setQuestionStatuses(
        {
            notAttempted: false,
            complete: false,
            incorrect: false,
            llmMarked: false,
            hideCompleted: false
        });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSearch = useCallback(
        debounce((searchTerm: string) => {
            setSearchQuery(searchTerm);
        }, 500),
        [setSearchQuery]
    );

    const pageHelp = <span>
        You can find a question by selecting the areas of interest, stage and difficulties.
        <br/>
        You can select more than one entry in each area.
    </span>;

    const metaDescription = siteSpecific(
        "Find physics, maths, chemistry and biology questions by topic and difficulty.",
        "Search for the perfect computer science questions to study. For revision. For homework. For the classroom."
    );

    const loadingPlaceholder = <div className="w-100 text-center pb-2">
        <h2 aria-hidden="true" className="pt-5">Searching...</h2>
        <IsaacSpinner />
    </div>;

    return <Container id="finder-page" className={classNames("mb-5", {"question-finder-container": isPhy})}>
        <TitleAndBreadcrumb currentPageTitle={"Question Finder"} help={pageHelp}/>
        <MetaDescription description={metaDescription}/>
        <CanonicalHrefElement/>
        <PageFragment fragmentId={"question_finder_intro"} ifNotFound={RenderNothing} />

        <Row>
            <Col lg={6} md={12} xs={12} className="finder-search">
                <Label htmlFor="question-search-title" className="mt-2"><b>Search for a question</b></Label>
                <Input id="question-search-title"
                    type="text"
                    className="py-4"
                    defaultValue={searchQuery}
                    placeholder={siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST")}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </Col>
        </Row>

        <Row className="mt-4">
            <Col lg={siteSpecific(4, 3)} md={12} xs={12} className="text-wrap my-2" data-testid="question-finder-filters">
                <QuestionFinderFilterPanel {...{
                    searchDifficulties, setSearchDifficulties,
                    searchTopics, setSearchTopics,
                    searchStages, setSearchStages,
                    searchExamBoards, setSearchExamBoards,
                    questionStatuses, setQuestionStatuses,
                    searchBooks, setSearchBooks,
                    excludeBooks, setExcludeBooks,
                    tiers, choices, selections, setTierSelection,
                    applyFilters, clearFilters,
                    filtersSelected, searchDisabled: filtersApplied || !filtersSelected
                }} />
            </Col>

            {/* TODO: update styling of question block */}
            <Col lg={siteSpecific(8, 9)} md={12} xs={12} className="text-wrap my-2" data-testid="question-finder-results">
                <Card>
                    <CardHeader className="finder-header pl-3">
                        <Col className={"px-0"}>
                            Showing <b>30</b> of <b>1235</b>.
                        </Col>
                    </CardHeader>
                    <CardBody className={classNames({"p-0 m-0": isAda && displayQuestions?.length})}>
                        <ShowLoading until={displayQuestions} placeholder={loadingPlaceholder}>
                            {!filtersApplied && searchQuery === "" ?
                                <em>Please select and apply filters</em> :
                                (displayQuestions?.length ?
                                    <>
                                        <LinkToContentSummaryList items={displayQuestions} />
                                        {displayQuestions && (totalQuestions ?? 0) > displayQuestions.length &&
                                        <div role="status" className={"alert alert-light border"}>
                                                {`${totalQuestions} questions match your criteria.`}<br/>
                                                Not found what you&apos;re looking for? Try refining your search filters.
                                        </div>}
                                    </> :
                                    <em>No results match your criteria</em>)
                            }
                        </ShowLoading>
                    </CardBody>
                </Card>
                {(filtersApplied || searchQuery !== "") &&
                    (displayQuestions?.length ?? 0) > 0 &&
                    <Row className="pt-3">
                        <Col className="d-flex justify-content-center mb-3">
                            <Button
                                onClick={() => {
                                    searchDebounce(
                                        searchQuery, searchTopics,
                                        searchExamBoards,
                                        searchBooks, searchStages,
                                        searchDifficulties,
                                        selections, tiers,
                                        excludeBooks,
                                        questionStatuses.hideCompleted,
                                        nextSearchOffset
                                            ? nextSearchOffset - 1
                                            : 0);
                                    setPageCount(c => c + 1);
                                    setDisableLoadMore(true);
                                }}
                                disabled={disableLoadMore}
                                outline
                            >
                                Load more
                            </Button>
                        </Col>
                    </Row>}
            </Col>
        </Row>
    </Container>;
});
