import React, {ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {AppState, clearQuestionSearch, logAction, searchQuestions, useAppDispatch, useAppSelector} from "../../state";
import debounce from "lodash/debounce";
import {
    arrayFromPossibleCsv,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    getFilteredExamBoardOptions,
    isAda,
    isLoggedIn,
    isPhy,
    Item,
    itemiseTag,
    ListParams,
    SEARCH_CHAR_LENGTH_LIMIT,
    SEARCH_RESULTS_PER_PAGE,
    siteSpecific,
    STAGE,
    STAGE_NULL_OPTIONS,
    TAG_ID,
    tags,
    toSimpleCSV,
    useQueryParams,
    useUserViewingContext,
} from "../../services";
import {ContentSummaryDTO, Difficulty, ExamBoard} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {RouteComponentProps, useHistory, withRouter} from "react-router";
import {ContentTypeVisibility, LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {ShowLoading} from "../handlers/ShowLoading";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import classNames from "classnames";
import queryString from "query-string";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import {Button, Card, CardBody, CardHeader, Col, Container, Input, InputGroup, Label, Row} from "reactstrap";
import {QuestionFinderFilterPanel} from "../elements/panels/QuestionFinderFilterPanel";
import {Tier, TierID} from "../elements/svg/HierarchyFilter";

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

function getInitialQuestionStatuses(params: ListParams): QuestionStatus {
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

export const QuestionFinder = withRouter(({location}: RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: AppState) => state && state.user);
    const userContext = useUserViewingContext();
    const params: ListParams = useQueryParams(false);
    const history = useHistory();

    const [searchTopics, setSearchTopics] = useState<string[]>(arrayFromPossibleCsv(params.topics));
    const [searchQuery, setSearchQuery] = useState<string>(params.query ? (params.query instanceof Array ? params.query[0] : params.query) : "");
    const [searchStages, setSearchStages] = useState<STAGE[]>(arrayFromPossibleCsv(params.stages) as STAGE[]);
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>(arrayFromPossibleCsv(params.difficulties) as Difficulty[]);
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>(arrayFromPossibleCsv(params.examBoards) as ExamBoard[]);
    const [searchStatuses, setSearchStatuses] = useState<QuestionStatus>(
        getInitialQuestionStatuses(params)
    );
    const [searchBooks, setSearchBooks] = useState<string[]>(arrayFromPossibleCsv(params.book));
    const [excludeBooks, setExcludeBooks] = useState<boolean>(!!params.excludeBooks);
    const [searchDisabled, setSearchDisabled] = useState(true);

    const [populatedUserContext, setPopulatedUserContext] = useState(false);

    useEffect(function populateFromUserContext() {
        if (isAda && isLoggedIn(user) && user.registeredContexts && user.registeredContexts.length > 1) {
            if (!params.stages) setSearchStages([STAGE.ALL]);
            if (!params.examBoards) setSearchExamBoards([EXAM_BOARD.ALL]);
        }
        else  {
            if (!STAGE_NULL_OPTIONS.includes(userContext.stage) && !params.stages) {
                setSearchStages([userContext.stage]);
            }
            if (!EXAM_BOARD_NULL_OPTIONS.includes(userContext.examBoard) && !params.examBoards) {
                setSearchExamBoards([userContext.examBoard]);
            }
        }
        setPopulatedUserContext(!!userContext.stage && !!userContext.examBoard);
    }, [userContext.stage, userContext.examBoard, user]);

    // this acts as an "on complete load", needed as we can only correctly update the URL once we have the user context *and* React has processed the above setStates
    useEffect(() => {
        if (populatedUserContext && (searchStages[0] === userContext.stage && (isPhy || searchExamBoards[0] === userContext.examBoard) || !isLoggedIn(user))) { 
            searchAndUpdateURL();
            setPopulatedUserContext(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [populatedUserContext, searchStages, searchExamBoards]);

    const [disableLoadMore, setDisableLoadMore] = useState(false);

    const [selections, setSelections] = useState<Item<TAG_ID>[][]>(
        processTagHierarchy(
            arrayFromPossibleCsv(params.subjects), 
            arrayFromPossibleCsv(params.fields), 
            arrayFromPossibleCsv(params.topics)
        )
    );

    const choices = [tags.allSubjectTags.map(itemiseTag)];
    let tierIndex;
    for (tierIndex = 0; tierIndex < selections.length && tierIndex < 2; tierIndex++)  {
        const selection = selections[tierIndex];
        if (selection.length !== 1) break;
        choices.push(tags.getChildren(selection[0].value).map(itemiseTag));
    }

    const tiers: Tier[] = [
        {id: "subjects" as TierID, name: "Subject"},
        {id: "fields" as TierID, name: "Field"},
        {id: "topics" as TierID, name: "Topic"}
    ].map(tier => ({...tier, for: "for_" + tier.id})).slice(0, tierIndex + 1);

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
        debounce((searchString: string, topics: string[], examBoards: string[],
            book: string[], stages: string[], difficulties: string[],
            hierarchySelections: Item<TAG_ID>[][], tiers: Tier[],
            excludeBooks: boolean, questionStatuses: QuestionStatus,
            startIndex: number) => {
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
                statuses: questionStatusToURIComponent(questionStatuses),
                fasttrack: false,
                startIndex,
                limit: SEARCH_RESULTS_PER_PAGE + 1 // request one more than we need to know if there are more results
            }));

            dispatch(logAction({
                type: "QUESTION_FINDER_SEARCH", searchString, ...filterParams, book, stages, difficulties, examBoards, questionStatuses, startIndex}));
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
        searchAndUpdateURL();
    };

    const searchAndUpdateURL = useCallback(() => {
        setPageCount(1);
        setDisableLoadMore(false);
        setDisplayQuestions(undefined);
        searchDebounce(
            searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages,
            searchDifficulties, selections, tiers, excludeBooks, searchStatuses, 0
        );

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
        if (filteringByStatus) {
            params.statuses = Object.entries(searchStatuses)
                .filter(([_k, isSet]) => isSet)
                .map(([status, _v]) => status).join(",");
        }

        if (isPhy) {
            tiers.forEach((tier, i) => {
                if (!selections[i] || selections[i].length === 0) {
                    return;
                }
                params[tier.id] = selections[i].map(item => item.value).join(",");
            });
        }

        history.replace({search: queryString.stringify(params, {encode: false}), state: location.state});
    }, [searchDebounce, searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages, searchDifficulties, selections, tiers, excludeBooks, searchStatuses, filteringByStatus]);

    // Automatically search for content whenever the searchQuery changes, without changing whether filters have been applied or not
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(searchAndUpdateURL, [searchQuery]);

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
            || selections.some(tier => tier.length > 0)
            || Object.entries(searchStatuses).some(e => e[1]));
    }, [searchDifficulties, searchTopics, searchExamBoards, searchStages, searchBooks, excludeBooks, selections, searchStatuses]);

    const clearFilters = useCallback(() => {
        setSearchDifficulties([]);
        setSearchTopics([]);
        setSearchExamBoards([]);
        setSearchStages([]);
        setSearchBooks([]);
        setExcludeBooks(false);
        setSelections([[], [], []]);
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

    const metaDescription = siteSpecific(
        "Find physics, maths, chemistry and biology questions by topic and difficulty.",
        "Search for the perfect computer science questions to study. For revision. For homework. For the classroom."
    );

    const loadingPlaceholder = <div className="w-100 text-center pb-2">
        <h2 aria-hidden="true" className="pt-5">Searching...</h2>
        <IsaacSpinner />
    </div>;

    return <Container id="finder-page" className={classNames("mb-5", {"question-finder-container": isPhy})}>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("Question Finder", "Practice questions")} help={pageHelp}/>
        <MetaDescription description={metaDescription}/>
        <CanonicalHrefElement/>
        <PageFragment fragmentId={"question_finder_intro"} ifNotFound={RenderNothing} />

        <Row>
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
        </Row>

        <Row className="mt-4 position-relative finder-panel">
            <Col lg={siteSpecific(4, 3)} md={12} xs={12} className="text-wrap my-2" data-testid="question-finder-filters">
                <QuestionFinderFilterPanel {...{
                    searchDifficulties, setSearchDifficulties,
                    searchTopics, setSearchTopics,
                    searchStages, setSearchStages,
                    searchExamBoards, setSearchExamBoards,
                    searchStatuses, setSearchStatuses,
                    searchBooks, setSearchBooks,
                    excludeBooks, setExcludeBooks,
                    tiers, choices, selections, setTierSelection,
                    applyFilters, clearFilters,
                    validFiltersSelected, searchDisabled, setSearchDisabled
                }} />
            </Col>
            <Col lg={siteSpecific(8, 9)} md={12} xs={12} className="text-wrap my-2" data-testid="question-finder-results">
                <Card>
                    <CardHeader className="finder-header pl-3">
                        <Col className={"px-0"}>
                            {displayQuestions && displayQuestions.length > 0
                                ? <>Showing <b>{displayQuestions.length}</b></>
                                : <>No results</>}
                            {(totalQuestions ?? 0) > 0
                            && !filteringByStatus
                            && <>{" "}of <b>{totalQuestions}</b></>}
                            .
                        </Col>
                    </CardHeader>
                    <CardBody className={classNames({"border-0": isPhy, "p-0": displayQuestions?.length, "m-0": isAda && displayQuestions?.length})}>
                        <ShowLoading until={displayQuestions} placeholder={loadingPlaceholder}>
                            {displayQuestions?.length
                                ? <LinkToContentSummaryList 
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
                                        selections, tiers,
                                        excludeBooks,
                                        searchStatuses,
                                        nextSearchOffset
                                            ? nextSearchOffset - 1
                                            : 0);
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
    </Container>;
});
