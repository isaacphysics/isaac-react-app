import React, { useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    AppState,
    clearQuestionSearch,
    searchQuestions,
    updateCurrentUser,
    useAppDispatch,
    useAppSelector
} from "../../state";
import debounce from "lodash/debounce";
import {MultiValue} from "react-select";
import {
    tags,
    DIFFICULTY_ICON_ITEM_OPTIONS,
    EXAM_BOARD_NULL_OPTIONS,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    groupTagSelectionsByParent,
    isAda,
    isPhy,
    isStaff,
    Item,
    logEvent,
    selectOnChange,
    siteSpecific,
    STAGE,
    useUserViewingContext,
    STAGE_NULL_OPTIONS,
    useQueryParams,
    arrayFromPossibleCsv,
    toSimpleCSV,
    itemiseByValue,
    TAG_ID,
    itemiseTag,
    isLoggedIn,
    SEARCH_RESULTS_PER_PAGE,
    DIFFICULTY_ITEM_OPTIONS
} from "../../services";
import {ContentSummaryDTO, Difficulty, ExamBoard} from "../../../IsaacApiTypes";
import {GroupBase} from "react-select/dist/declarations/src/types";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import { RouteComponentProps, useHistory, withRouter } from "react-router";
import { LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { ShowLoading } from "../handlers/ShowLoading";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { MetaDescription } from "../elements/MetaDescription";
import { CanonicalHrefElement } from "../navigation/CanonicalHrefElement";
import { HierarchyFilterHexagonal, Tier, TierID } from "../elements/svg/HierarchyFilter";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import classNames from "classnames";
import queryString from "query-string";
import { PageFragment } from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Dropdown, DropdownMenu, DropdownToggle, Form, Input, Label, Row, UncontrolledTooltip } from "reactstrap";
import { CollapsibleList } from "../elements/CollapsibleList";
import { DifficultyIcons } from "../elements/svg/DifficultyIcons";

interface questionStatus {
    notAttempted: boolean;
    complete: boolean;
    incorrect: boolean;
    llmMarked: boolean;
    revisionMode: boolean;
    hideCompleted: boolean; // TODO: remove when implementing desired filters
}

const selectStyle = {
    className: "basic-multi-select", classNamePrefix: "select",
    menuPortalTarget: document.body, styles: {menuPortal: (base: object) => ({...base, zIndex: 9999})}
};

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

function simplifyDifficultyLabel(difficultyLabel: string): string {
    const labelLength = difficultyLabel.length;
    const type = difficultyLabel.slice(0, labelLength - 4);
    const level = difficultyLabel.slice(labelLength - 2, labelLength - 1);
    return type + level;
}

export const QuestionFinder = withRouter(({location}: RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const userContext = useUserViewingContext();
    const userPreferences = useAppSelector((state: AppState) => state?.userPreferences);
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
    const [questionStatuses, setQuestionStatuses] = useState<questionStatus>(
        {
            notAttempted: false,
            complete: false,
            incorrect: false,
            llmMarked: false,
            revisionMode: !!userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS,
            hideCompleted: !!params.hideCompleted
        }
    );
    const [numExpanded, setExpanded] = useState<number>(0);
    const [allExpanded, setAllExpanded] = useState<boolean | undefined>(undefined);

    useEffect(function syncAllExpandedAndNumExpanded() {
        // If the user manually close all the list after expanding them
        // OR if the user manually opens a list after closing them all
        if ((numExpanded === 0 && allExpanded)
           || (numExpanded > 0 && !allExpanded)) {
            // Go into the undefined state until being clicked
            setAllExpanded(undefined);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numExpanded]);

    useEffect(function populateExamBoardFromUserContext() {
        if (!EXAM_BOARD_NULL_OPTIONS.includes(userContext.examBoard)) setSearchExamBoards([userContext.examBoard]);
    }, [userContext.examBoard]);

    useEffect(function populateStageFromUserContext() {
        if (!STAGE_NULL_OPTIONS.includes(userContext.stage)) setSearchStages([userContext.stage]);
    }, [userContext.stage]);

    const [searchBooks, setSearchBooks] = useState<string[]>(arrayFromPossibleCsv(params.book));
    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(!!params.fasttrack);
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

    const tagOptions: { options: Item<string>[]; label: string }[] = isPhy ? tags.allTags.map(groupTagSelectionsByParent) : tags.allSubcategoryTags.map(groupTagSelectionsByParent);
    const groupBaseTagOptions: GroupBase<Item<string>>[] = tagOptions;
    const bookOptions: Item<string>[] = [
        {value: "phys_book_step_up", label: "Step Up to GCSE Physics"},
        {value: "phys_book_gcse", label: "GCSE Physics"},
        {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
        {value: "physics_linking_concepts", label: "Linking Concepts in Pre-Uni Physics"},
        {value: "maths_book_gcse", label: "GCSE Maths"},
        {value: "maths_book", label: "Pre-Uni Maths"},
        {value: "chemistry_16", label: "A-Level Physical Chemistry"}
    ];

    const {results: questions, totalResults: totalQuestions, nextSearchOffset} = useAppSelector((state: AppState) => state && state.questionSearchResult) || {};
    const user = useAppSelector((state: AppState) => state && state.user);

    const searchDebounce = useCallback(
                            debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], hierarchySelections: Item<TAG_ID>[][], tiers: Tier[], fasttrack: boolean, hideCompleted: boolean, startIndex: number) => {
            if ([searchString, topics, book, stages, difficulties, examBoards].every(v => v.length === 0) && hierarchySelections.every(v => v.length === 0) && !fasttrack) {
                // Nothing to search for
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
                books: book.join(",") || undefined,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoardString,
                fasttrack,
                hideCompleted,
                startIndex,
                limit: SEARCH_RESULTS_PER_PAGE + 1 // request one more than we need, as to know if there are more results
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, examBoards, book, stages, difficulties, fasttrack, startIndex});
        }, 250),
        []
    );

    const setTierSelection = (tierIndex: number) => {
        return ((values: Item<TAG_ID>[]) => {
            const newSelections = selections.slice(0, tierIndex);
            newSelections.push(values);
            setSelections(newSelections);
        }) as React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>;
    };

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
        searchDebounce(searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages, searchDifficulties, selections, tiers, searchFastTrack, questionStatuses.hideCompleted, 0);

        const params: {[key: string]: string} = {};
        if (searchStages.length) params.stages = toSimpleCSV(searchStages);
        if (searchDifficulties.length) params.difficulties = toSimpleCSV(searchDifficulties);
        if (searchQuery.length) params.query = encodeURIComponent(searchQuery);
        if (isAda && searchTopics.length) params.topics = toSimpleCSV(searchTopics);
        if (isAda && searchExamBoards.length) params.examBoards = toSimpleCSV(searchExamBoards);
        if (isPhy && searchBooks.length) params.book = toSimpleCSV(searchBooks);
        if (isPhy && searchFastTrack) params.fasttrack = "set";
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
        return searchDifficulties.length > 0
            || searchTopics.length > 0
            || searchExamBoards.length > 0
            || searchStages.length > 0
            || searchBooks.length > 0
            || Object.entries(questionStatuses)
                .filter(e => e[0] !== "revisionMode") // Ignore revision mode as it isn't really a filter
                .some(e => e[1]);
    }, [questionStatuses, searchBooks.length, searchDifficulties.length, searchExamBoards.length, searchStages.length, searchTopics.length]);

    const clearFilters = () => {
        setSearchDifficulties([]);
        setSearchTopics([]);
        setSearchExamBoards([]);
        setSearchStages([]);
        setSearchBooks([]);
        setQuestionStatuses(
        {
            notAttempted: false,
            complete: false,
            incorrect: false,
            llmMarked: false,
            revisionMode: !!userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS,
            hideCompleted: false
        });
    };

    const debouncedRevisionModeUpdate = useCallback(debounce(() => {
        if (user && isLoggedIn(user)) {
            const userToUpdate = {...user, password: null};
            const userPreferencesToUpdate = {
                DISPLAY_SETTING: {...userPreferences?.DISPLAY_SETTING, HIDE_QUESTION_ATTEMPTS: !userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS}
            };
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, undefined, null, user, false));
        }}, 250, {trailing: true}
    ), []);

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
            <Col xs={6} className="finder-search">
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
            <Col xs={siteSpecific(4, 3)} className="text-wrap my-2" data-testid="question-finder-filters">
                <Card>
                    <CardHeader className="finder-header pl-3">
                        <Col xs={2}>
                            <img
                                src="/assets/common/icons/filter-icon.svg"
                                alt="Filter"
                                style={{width: 18}}
                                className="ms-1"
                            />
                        </Col>
                        <Col className={"px-0 mt-1"}>
                            <b>Filter by</b>
                        </Col>
                        {filtersSelected && <div className="pe-1">
                            <button
                                className={"text-black mt-1 bg-white bg-opacity-10 btn-link"}
                                onClick={clearFilters}
                            >Clear all</button>
                        </div>}
                        <div>
                            <button
                                className="bg-white bg-opacity-10 p-0"
                                onClick={() => setAllExpanded(numExpanded === 0)}
                            >
                                <img className={classNames("icon-dropdown-90", {"active": numExpanded > 0})} src={"/assets/common/icons/chevron_right.svg"} alt="" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0 m-0">
                        <CollapsibleList
                            title="Stage" expanded allExpanded={allExpanded}
                            numberSelected={searchStages.length}
                            onExpand={(isExpanded) => {isExpanded ? setExpanded(prevExpanded => prevExpanded + 1) : setExpanded(prevExpanded => prevExpanded - 1);}}
                        >
                            {getFilteredStageOptions().map((stage, index) => (
                                <div className="w-100 ps-3 py-1 bg-white" key={index}>
                                    <StyledCheckbox
                                        color="primary"
                                        checked={searchStages.includes(stage.value)}
                                        onChange={() => setSearchStages(s => s.includes(stage.value) ? s.filter(v => v !== stage.value) : [...s, stage.value])}
                                        label={<span>{stage.label}</span>}
                                    />
                                </div>
                            ))}
                        </CollapsibleList>
                        {isAda && <CollapsibleList
                            title="Exam board" allExpanded={allExpanded}
                            numberSelected={searchExamBoards.length}
                            onExpand={(isExpanded) => {isExpanded ? setExpanded(prevExpanded => prevExpanded + 1) : setExpanded(prevExpanded => prevExpanded - 1);}}
                        >
                            {getFilteredExamBoardOptions().map((board, index) => (
                                <div className="w-100 ps-3 py-1 bg-white" key={index}>
                                    <StyledCheckbox
                                        color="primary"
                                        checked={searchExamBoards.includes(board.value)}
                                        onChange={() => setSearchExamBoards(s => s.includes(board.value) ? s.filter(v => v !== board.value) : [...s, board.value])}
                                        label={<span>{board.label}</span>}
                                    />
                                </div>
                            ))}
                        </CollapsibleList>}
                        <CollapsibleList
                            title="Topics" allExpanded={allExpanded}
                            numberSelected={searchTopics.length}
                            onExpand={(isExpanded) => {isExpanded ? setExpanded(prevExpanded => prevExpanded + 1) : setExpanded(prevExpanded => prevExpanded - 1);}}
                        >
                            {siteSpecific(
                                <div>
                                    <HierarchyFilterHexagonal {...{tiers, choices, selections: selections, questionFinderFilter: true, setTierSelection}} />
                                </div>,
                                groupBaseTagOptions.map((tag, index) => (
                                    // TODO: make subList
                                    <CollapsibleList
                                        title={tag.label} key={index} subList
                                        allExpanded={allExpanded}
                                    >
                                        {tag.options.map((topic, index) => (
                                            <div className="w-100 ps-3 py-1 bg-white" key={index}>
                                                <StyledCheckbox
                                                    color="primary"
                                                    checked={searchTopics.includes(topic.value)}
                                                    onChange={() => setSearchTopics(
                                                        s => s.includes(topic.value)
                                                            ? s.filter(v => v !== topic.value)
                                                            : [...s, topic.value]
                                                    )}
                                                    label={<span>{topic.label}</span>}
                                                    className="ps-3"
                                                />
                                            </div>
                                        ))}
                                    </CollapsibleList>
                                ))
                            )}
                        </CollapsibleList>
                        <CollapsibleList
                            title={siteSpecific("Difficulty", "Question difficulty")}
                            allExpanded={allExpanded}
                            numberSelected={searchDifficulties.length}
                            onExpand={(isExpanded) => {isExpanded ? setExpanded(prevExpanded => prevExpanded + 1) : setExpanded(prevExpanded => prevExpanded - 1);}}
                        >
                            <div className="ps-3">
                                <button
                                    className="p-0 bg-white h-min-content btn-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // TODO: add modal
                                        console.log("show difficulty modal here");
                                }}>
                                    <small><b>What do the different difficulty levels mean?</b></small>
                                </button>
                            </div>
                            {DIFFICULTY_ITEM_OPTIONS.map((difficulty, index) => (
                                <div className="w-100 ps-3 py-1 bg-white" key={index}>
                                    <StyledCheckbox
                                        color="primary"
                                        checked={searchDifficulties.includes(difficulty.value)}
                                        onChange={() => setSearchDifficulties(
                                            s => s.includes(difficulty.value)
                                                ? s.filter(v => v !== difficulty.value)
                                                : [...s, difficulty.value]
                                        )}
                                        label={<div className="d-flex align-items-center">
                                            <span className="me-2">{simplifyDifficultyLabel(difficulty.label)}</span>
                                            <DifficultyIcons difficulty={difficulty.value} blank={true} classnames="mt-n2"/>
                                        </div>}
                                    />
                                </div>
                            ))}
                        </CollapsibleList>
                        {isPhy && <CollapsibleList
                            title="Book" allExpanded={allExpanded}
                            numberSelected={searchBooks.length}
                            onExpand={(isExpanded) => {isExpanded ? setExpanded(prevExpanded => prevExpanded + 1) : setExpanded(prevExpanded => prevExpanded - 1);}}
                        >
                            {bookOptions.map((book, index) => (
                                <div className="w-100 ps-3 py-1 bg-white" key={index}>
                                    <StyledCheckbox
                                        color="primary"
                                        checked={searchBooks.includes(book.value)}
                                        onChange={() => setSearchBooks(
                                            s => s.includes(book.value)
                                                ? s.filter(v => v !== book.value)
                                                : [...s, book.value]
                                        )}
                                        label={<span className="me-2">{book.label}</span>}
                                    />
                                </div>
                            ))}
                        </CollapsibleList>}
                        <CollapsibleList
                            title={siteSpecific("Status", "Question status")}
                            allExpanded={allExpanded}
                            numberSelected={Object.values(questionStatuses).reduce((acc, item) => acc + item, 0)}
                            onExpand={(isExpanded) => {isExpanded ? setExpanded(prevExpanded => prevExpanded + 1) : setExpanded(prevExpanded => prevExpanded - 1);}}
                        >
                            <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                                <StyledCheckbox
                                    color="primary"
                                    checked={questionStatuses.hideCompleted}
                                    onChange={() => setQuestionStatuses(s => {return {...s, hideCompleted: !s.hideCompleted};})}
                                    label={<div>
                                        <span>Hide complete</span>
                                    </div>}
                                />
                            </div>
                            {/* TODO: implement new completeness filters
                            <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                                <StyledCheckbox
                                    color="primary"
                                    checked={questionStatuses.notAttempted}
                                    onChange={() => setQuestionStatuses(s => {return {...s, notAttempted: !s.notAttempted};})}
                                    label={<div>
                                        <span>Not attempted</span>
                                        <img
                                            src="/assets/common/icons/not-started.svg"
                                            alt="Not attempted"
                                            style={{width: 23}}
                                            className="ms-1"
                                        />
                                    </div>}
                                />
                            </div>
                            <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                                <StyledCheckbox
                                    color="primary"
                                    checked={questionStatuses.complete}
                                    onChange={() => setQuestionStatuses(s => {return {...s, complete: !s.complete};})}
                                    label={<div>
                                        <span>Completed</span>
                                        <img
                                            src="/assets/common/icons/completed.svg"
                                            alt="Completed"
                                            style={{width: 23}}
                                            className="ms-1"
                                        />
                                    </div>}
                                />
                            </div>
                            <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                                <StyledCheckbox
                                    color="primary"
                                    checked={questionStatuses.incorrect}
                                    onChange={() => setQuestionStatuses(s => {return {...s, incorrect: !s.incorrect};})}
                                    label={<div>
                                        <span>Try again</span>
                                        <img
                                            src="/assets/common/icons/incorrect.svg"
                                            alt="Try again"
                                            style={{width: 23}}
                                            className="ms-1"
                                        />
                                    </div>}
                                />
                            </div>*/}
                            <div className="pb-2">
                                <hr className="m-0 filter-separator"/>
                            </div>
                            {/* TODO: implement once necessary tags are available
                            {isAda && <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                                <StyledCheckbox
                                    color="primary"
                                    checked={questionStatuses.llmMarked}
                                    onChange={() => setQuestionStatuses(s => {return {...s, llmMarked: !s.llmMarked};})}
                                    label={<span>
                                        {"Include "}
                                        <button
                                        className="p-0 bg-white h-min-content btn-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // TODO: add modal
                                            console.log("show LLM modal here");
                                        }}>
                                            LLM marked
                                        </button>
                                        {" questions"}
                                    </span>}
                                />
                            </div>}*/}
                            <div className="w-100 ps-3 py-1 bg-white" key={index}>
                                <StyledCheckbox
                                    color="primary"
                                    checked={questionStatuses.revisionMode}
                                    onChange={() => {
                                        setQuestionStatuses(s => {return {...s, revisionMode: !s.revisionMode};});
                                        debouncedRevisionModeUpdate();
                                    }}
                                    label={<span><button
                                        className="p-0 bg-white h-min-content btn-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // TODO: add modal
                                            console.log("show revision mode modal here");
                                        }}>
                                            Revision mode
                                    </button></span>}
                                />
                            </div>
                        </CollapsibleList>
                        <Col className="text-center my-3 filter-btn">
                            <Button
                                onClick={applyFilters}
                                disabled={[
                                    searchQuery, searchTopics, searchBooks,
                                    searchStages, searchDifficulties, searchExamBoards
                                ].every(v => v.length === 0)
                                && selections.every(v => v.length === 0)}
                            >
                                Apply filters
                            </Button>
                        </Col>
                    </CardBody>
                </Card>
            </Col>

            {/* TODO: update styling of question block */}
            <Col xs={siteSpecific(8, 9)} className="text-wrap my-2" data-testid="question-finder-results">
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
                                        <LinkToContentSummaryList items={displayQuestions.map(q => 
                                            ({...q, correct: questionStatuses.revisionMode ? undefined : q.correct}) as ContentSummaryDTO)}/>
                                        <Row>
                                            <Col className="d-flex justify-content-center mb-3">
                                                <Button
                                                    onClick={() => {
                                                        searchDebounce(searchQuery, searchTopics, searchExamBoards, searchBooks, searchStages, searchDifficulties, selections, tiers, searchFastTrack, questionStatuses.hideCompleted, nextSearchOffset ? nextSearchOffset - 1 : 0);
                                                        setPageCount(c => c + 1);
                                                        setDisableLoadMore(true);
                                                    }}
                                                    disabled={disableLoadMore}
                                                >
                                                    Load more
                                                </Button>
                                            </Col>
                                        </Row>
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
            </Col>
        </Row>


        {/* Previous finder. TODO: remove */}

        {/* <Card id="finder-panel" className="mx-auto mt-4 mb-5">
            <CardBody className={"px-2 py-3 p-sm-4 pb-5"}>
                <Row className={"mb-3"}>
                    <Col>
                        <span>Specify your search criteria and we will find questions related to your chosen filter(s).</span>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6} className={`text-wrap my-2`}>
                        <Label htmlFor="question-search-stage">Stage</Label>
                        <StyledSelect
                            inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={getFilteredStageOptions().filter(o => searchStages.includes(o.value))}
                            options={getFilteredStageOptions()}
                            onChange={selectOnChange(setSearchStages, true)}
                        />
                    </Col>
                    <Col lg={6} className="text-wrap my-2">
                        <Label htmlFor="question-search-difficulty">Difficulty</Label>
                        <StyledSelect
                            inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={itemiseByValue(searchDifficulties, DIFFICULTY_ICON_ITEM_OPTIONS)}
                            options={DIFFICULTY_ICON_ITEM_OPTIONS}
                            onChange={selectOnChange(setSearchDifficulties, true)}
                        />
                    </Col>
                    {isAda && <Col lg={6} className="text-wrap my-2">
                        <Label htmlFor="question-search-exam-board">Exam Board</Label>
                        <StyledSelect
                            inputId="question-search-exam-board" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={getFilteredExamBoardOptions({byStages: searchStages}).filter(o => searchExamBoards.includes(o.value))}
                            options={getFilteredExamBoardOptions({byStages: searchStages})}
                            onChange={(s: MultiValue<Item<ExamBoard>>) => selectOnChange(setSearchExamBoards, true)(s)}
                        />
                    </Col>}
                </Row>
                <Row>
                    <Col lg={siteSpecific(9, 12)} className={`text-wrap mt-2`}>
                        <Label htmlFor="question-search-topic">Topic</Label>
                        {siteSpecific(
                            <HierarchyFilterHexagonal {...{tiers, choices, selections: selections, setTierSelection}} />,
                            <StyledSelect
                                inputId="question-search-topic" isMulti placeholder="Any" {...selectStyle}
                                value={itemiseByValue(searchTopics, groupBaseTagOptions.flatMap(tag => tag.options))}
                                options={groupBaseTagOptions} onChange={(x : readonly Item<string>[], {action: _action}) => {
                                    selectOnChange(setSearchTopics, true)(x);
                                }}
                            />
                        )}
                    </Col>
                </Row>
                <Row>
                    {isPhy && <Col lg={12} className="text-wrap my-2">
                        <Label htmlFor="question-search-book">Book</Label>
                        <StyledSelect
                            inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                            value={itemiseByValue(searchBook, bookOptions)}
                            onChange={(e) => {
                                selectOnChange(setSearchBook, true)(e);
                            }}
                            options={bookOptions}
                        />
                    </Col>}
                </Row>
                <Row>
                    {isPhy && isStaff(user) && <Col className="text-wrap mb-2">
                        <Form>
                            <Label check><input type="checkbox" checked={searchFastTrack} onChange={e => setSearchFastTrack(e.target.checked)} />{' '}Show FastTrack questions</Label>
                        </Form>
                    </Col>}
                </Row>
                <Row>
                    <Col lg={12} className="text-wrap mt-2">
                        <Label htmlFor="question-search-title">Search</Label>
                        <Input id="question-search-title"
                            type="text"
                            placeholder={siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST")}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </Col>
                </Row>

                {user && isLoggedIn(user) && <Row>
                    <Form>
                        <Col className="mt-4">
                            <div className="d-flex">
                                <StyledCheckbox
                                    checked={revisionMode}
                                    onChange={() => {
                                        setRevisionMode(r => !r);
                                        debouncedRevisionModeUpdate();
                                    }}
                                    label={<p>Revision mode</p>}
                                />
                                <span id="revision-mode-checkbox" className="icon-help"/>
                                <UncontrolledTooltip target="revision-mode-checkbox" placement="top" autohide={false}>
                                    Revision mode hides your previous answers, so you can practice questions that you have answered before.
                                </UncontrolledTooltip>
                            </div>
                            <div className="d-flex">
                                <StyledCheckbox
                                    checked={hideCompleted}
                                    onChange={() => setHideCompleted(h => !h)}
                                    label={<p>Hide completed questions</p>}
                                    disabled={revisionMode}
                                />
                            </div>
                        </Col>
                    </Form>
                </Row>}
            </CardBody>
        </Card>
        <Card>
            <CardHeader className="finder-header">
                <Col className={"pe-0"}>
                    <h3>
                        Results
                    </h3>
                </Col>
            </CardHeader>
            <CardBody className={classNames({"p-0 m-0": isAda && displayQuestions?.length})}>
                <ShowLoading until={displayQuestions} placeholder={loadingPlaceholder}>
                    {[searchQuery, searchTopics, searchBook, searchStages, searchDifficulties, searchExamBoards].every(v => v.length === 0) &&
                     selections.every(v => v.length === 0) ?
                        <em>Please select filters</em> :
                        (displayQuestions?.length ?
                            <>
                                <LinkToContentSummaryList items={displayQuestions.map(q => ({...q, correct: revisionMode ? undefined : q.correct}) as ContentSummaryDTO)}/>
                                <Row>
                                    <Col className="d-flex justify-content-center mb-3">
                                        <Button
                                            onClick={() => {
                                                searchDebounce(searchQuery, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, selections, tiers, searchFastTrack, hideCompleted, nextSearchOffset ? nextSearchOffset - 1 : 0);
                                                setPageCount(c => c + 1);
                                                setDisableLoadMore(true);
                                            }}
                                            disabled={disableLoadMore}
                                        >
                                            Load more
                                        </Button>
                                    </Col>
                                </Row>
                                {displayQuestions && (totalQuestions ?? 0) > displayQuestions.length &&
                                <div role="status" className={"alert alert-light border"}>
                                        {`${totalQuestions} questions match your criteria.`}<br/>
                                        Not found what you&apos;re looking for? Try refining your search filters.
                                </div>}
                            </> :
                            <em>No results found</em>)
                    }
                </ShowLoading>
            </CardBody>
        </Card> */}
    </Container>;
});
