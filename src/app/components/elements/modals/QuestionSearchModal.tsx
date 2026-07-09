import React, {lazy, startTransition, useEffect, useMemo, useReducer, useState} from "react";
import {
    AppState,
    closeActiveModal,
    useAppDispatch,
    useAppSelector,
    useSearchQuestionsQuery
} from "../../../state";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import {GroupBase, MultiValue} from "react-select";
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
    searchResultIsPublic,
    selectOnChange,
    siteSpecific,
    SortOrder,
    sortQuestions,
    STAGE,
    useUserViewingContext,
    ISAAC_BOOKS,
    TAG_LEVEL,
    EXAM_BOARD, QUESTIONS_PER_GAMEBOARD,
    simpleDifficultyLabelMap,
    stageLabelMap,
    TAG_ID,
    itemise,
    difficultyLabelMap,
    reactSelectDarkModeStyles
} from "../../../services";
import {ContentSummary, GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps, QuestionSearchQuery} from "../../../../IsaacAppTypes";
import {AudienceContext, ContentSummaryDTO, Difficulty, ExamBoard} from "../../../../IsaacApiTypes";
import {Loading} from "../../handlers/IsaacSpinner";
import {StyledSelect} from "../inputs/StyledSelect";
import { SortItemHeader } from "../SortableItemHeader";
import { Input, Row, Col, Label, Table } from "reactstrap";
import classNames from "classnames";
import { HierarchyFilterTreeList } from "../svg/HierarchyFilter";
import { ChoiceTree, getChoiceTreeLeaves } from "../panels/QuestionFinderFilterPanel";
import { CollapsibleList } from "../CollapsibleList";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { updateTopicChoices, initialiseListState, listStateReducer } from "../../../services";
import { HorizontalScroller } from "../inputs/HorizontalScroller";
import { skipToken } from "@reduxjs/toolkit/query";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { FilterSummary } from "../../pages/QuestionFinder";
import { pruneTreeNode } from "../../../services/questionHierarchy";

// Immediately load GameboardBuilderTableRow, but allow splitting
const importGameboardBuilderTableRow = import("../GameboardBuilderTableRow");
const GameboardBuilderTableRow = lazy(() => importGameboardBuilderTableRow);

const selectStyle = {
    className: "basic-multi-select", 
    classNamePrefix: "select",
    menuPortalTarget: document.body, 
    styles: reactSelectDarkModeStyles
};

interface QuestionSearchModalProps {
    currentQuestions: GameboardBuilderQuestions;
    undoStack: GameboardBuilderQuestionsStackProps;
    redoStack: GameboardBuilderQuestionsStackProps;
    eventLog: object[];
}
export const QuestionSearchModal = (
    {currentQuestions, undoStack, redoStack, eventLog}: QuestionSearchModalProps) => {
    const dispatch = useAppDispatch();
    const userContext = useUserViewingContext();
    const sublistDelimiter = " >>> ";

    const [searchParams, setSearchParams] = useState<QuestionSearchQuery | typeof skipToken>(skipToken);
    const searchQuestionsQuery = useSearchQuestionsQuery(searchParams);

    const [topicSelections, setTopicSelections] = useState<ChoiceTree[]>([]);
    const [searchTopics, setSearchTopics] = useState<string[]>([]);
    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchStages, setSearchStages] = useState<STAGE[]>([]);
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>([]);
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>([]);
    useEffect(function populateExamBoardFromUserContext() {
        const userExamBoard = userContext.contexts[0].examBoard as EXAM_BOARD;
        if (userContext.contexts.length === 1 && !EXAM_BOARD_NULL_OPTIONS.includes(userExamBoard)) setSearchExamBoards([userExamBoard]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userContext.contexts[0].examBoard]);

    const [searchBook, setSearchBook] = useState<string[]>([]);
    const isBookSearch = searchBook.length > 0;

    const creationContext: AudienceContext = useMemo(() => !isBookSearch ? {
        stage: searchStages.length > 0 ? searchStages : undefined,
        difficulty: searchDifficulties.length > 0 ? searchDifficulties : undefined,
        examBoard: searchExamBoards.length > 0 ? searchExamBoards : undefined,
    } : {}, [isBookSearch, searchStages, searchDifficulties, searchExamBoards]);

    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(false);
    const [searchBookmarks, setSearchBookmarks] = useState<boolean>(false);

    const [questionsSort, setQuestionsSort] = useState<Record<string, SortOrder>>({});
    const [selectedQuestions, setSelectedQuestions] = useState<Map<string, ContentSummary>>(new Map(currentQuestions.selectedQuestions));
    const [questionOrder, setQuestionOrder] = useState([...currentQuestions.questionOrder]);

    const modalQuestions : GameboardBuilderQuestions = {selectedQuestions, questionOrder, setSelectedQuestions, setQuestionOrder};

    const user = useAppSelector((state: AppState) => state && state.user);

    const searchDebounce = useMemo(() => 
        debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], fasttrack: boolean, startIndex: number, bookmarks: boolean) => {
            // Clear front-end sorting so as not to override ElasticSearch's match ranking
            setQuestionsSort({});

            if ([searchString, topics, book, stages, difficulties, examBoards].every(v => v.length === 0) && !fasttrack && !bookmarks) {
                // Nothing to search for
                return setSearchParams(skipToken);
            }

            const topicTags = [...([topics].map((tags) => tags.join(" ")))].filter((query) => query != "").join(",");
            const bookTags = book.join(",");

            setSearchParams({
                querySource: "gameboardBuilder",
                searchString: searchString || undefined,
                tags: topicTags,
                books: bookTags,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoards.join(",") || undefined,
                fasttrack,
                startIndex,
                bookmarks,
                limit: 300,
            });

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, examBoards, book, stages, difficulties, fasttrack, startIndex});
        }, 250, { leading: true }),
    [eventLog]);

    const sortableTableHeaderUpdateState = (sortState: Record<string, SortOrder>, setSortState: React.Dispatch<React.SetStateAction<Record<string, SortOrder>>>, key: string) => (order: SortOrder) => {
        const newSortState = {...sortState};
        newSortState[key] = order;
        setSortState(newSortState);
    };

    const tagOptions: { options: Item<string>[]; label: string }[] = isPhy ? tags.allTags.map(groupTagSelectionsByParent) : tags.allSubcategoryTags.map(groupTagSelectionsByParent);
    const groupBaseTagOptions: GroupBase<Item<string>>[] = tagOptions;
    const [listState, listStateDispatch] = useReducer(listStateReducer, groupBaseTagOptions, initialiseListState);

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, searchFastTrack, 0, searchBookmarks);
    },[searchDebounce, searchQuestionName, searchTopics, searchExamBoards, searchBook, searchFastTrack, searchStages, searchDifficulties, searchBookmarks]);

    const sortAndFilterBySearch = (questions: ContentSummaryDTO[]) => questions && sortQuestions({...questionsSort, ...(isBookSearch ? {book: SortOrder.ASC} : {})}, creationContext)(
        questions.filter(question => {
            const qIsPublic = searchResultIsPublic(question, user);
            if (isBookSearch) return qIsPublic;
            const qTopicsMatch =
                searchTopics.length === 0 ||
                (question.tags && question.tags.filter((tag) => searchTopics.includes(tag)).length > 0);

            return qIsPublic && qTopicsMatch;
        }).sort(
            searchBookmarks
                ? (a, b) => new Date(b?.bookmarked ?? 0).getTime() - new Date(a?.bookmarked ?? 0).getTime()
                : () => 0
        )
    );

    const addSelectionsRow = <div className="d-flex flex-column sticky-bottom align-items-center pt-3 pb-5 bg-white">
        <div className="flex-grow-1 mb-1">
            <strong className={classNames({"text-danger": selectedQuestions.size > QUESTIONS_PER_GAMEBOARD})}>
                {`${selectedQuestions.size} question${selectedQuestions.size !== 1 ? "s" : ""} selected`}
            </strong>
        </div>
        <div>
            <Input
                type="button"
                value={siteSpecific("Add selections to question deck", "Add selections to quiz")}
                disabled={isEqual(new Set(modalQuestions.selectedQuestions.keys()), new Set(currentQuestions.selectedQuestions.keys()))}
                className={classNames("btn w-100 h-100", siteSpecific("btn-keyline", "btn-solid border-0"))}
                onClick={() => {
                    undoStack.push({questionOrder: currentQuestions.questionOrder, selectedQuestions: currentQuestions.selectedQuestions});
                    currentQuestions.setSelectedQuestions(modalQuestions.selectedQuestions);
                    currentQuestions.setQuestionOrder(modalQuestions.questionOrder);
                    redoStack.clear();
                    dispatch(closeActiveModal());
                }}
            />
        </div>
    </div>;

    const topicChoices = useMemo(() => {
        return updateTopicChoices(topicSelections);
    }, [topicSelections]);

    // The (phy) hierarchy filter uses a ChoiceTree, but the search endpoint needs a string
    useEffect(() => {
        setSearchTopics(getChoiceTreeLeaves(topicSelections).map((s) => s.value));
    }, [topicSelections]);

    const selectionList: Item<TAG_ID>[] = getChoiceTreeLeaves(topicSelections);

    const filterTags = useMemo(() => [
        searchDifficulties.map(d => {return {value: d, label: simpleDifficultyLabelMap[d]};}),
        searchStages.map(s => {return {value: s, label: stageLabelMap[s]};}),
        searchBook.map(b => {const book = ISAAC_BOOKS.find(book => book.tag === b); return {value: b, label: book ? book.shortTitle : b};}),
        selectionList,
        searchFastTrack ? [{value: "fasttrack", label: "FastTrack"}] : [],
        searchBookmarks ? [{value: "bookmarked", label: "Bookmarked"}] : [],
    ].flat(), [searchBook, searchBookmarks, searchDifficulties, searchFastTrack, searchStages, selectionList]);

    const removeFilterTag = (filter: string) => {
        if (searchStages.includes(filter as STAGE)) {
            setSearchStages(searchStages.filter(f => f !== filter));
        } else if (getChoiceTreeLeaves(topicSelections).some(leaf => leaf.value === filter)) {
            setTopicSelections(pruneTreeNode(topicSelections, filter, true));
        } else if (searchDifficulties.includes(filter as Difficulty)) {
            setSearchDifficulties(searchDifficulties.filter(f => f !== filter));
        } else if (searchExamBoards.includes(filter as ExamBoard)) {
            setSearchExamBoards(searchExamBoards.filter(f => f !== filter));
        } else if (searchBook.includes(filter)) {
            setSearchBook(sb => sb.filter(f => f !== filter));
        } else if (filter === "fasttrack") {
            setSearchFastTrack(false);
        } else if (filter === "bookmarked") {
            setSearchBookmarks(false);
        }
    };

    const clearFilters = () => {
        setSearchDifficulties([]);
        setSearchTopics([]);
        setSearchExamBoards([]);
        setSearchStages([]);
        setSearchBook([]);
        setTopicSelections([{}, {}, {}]);
        setSearchFastTrack(false);
        setSearchBookmarks(false);
    };

    // only allowing search for a single book makes sense in this context, but we track it as an array to align with the other filters
    const selectedBook = searchBook.length > 0 ? ISAAC_BOOKS.find(b => b.tag === searchBook[0]) : undefined;

    return <>
        <Row>
            <Col xs={siteSpecific(9, 12)}>
                <Label htmlFor="question-search-title">Search</Label>
                <Input id="question-search-title" className="mb-3"
                    type="text"
                    placeholder={siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </Col>
            {isPhy && <Col xs={3}>
                <div className="mb-2">
                    <Label htmlFor="question-search-book">Book</Label>
                    <StyledSelect
                        value={selectedBook ? {value: selectedBook.tag, label: selectedBook.shortTitle} : null}
                        inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                        onChange={selectOnChange(setSearchBook, true)}
                        options={ISAAC_BOOKS.filter(b => !b.hidden).map(book => ({value: book.tag, label: book.shortTitle}))}
                    />
                </div>
            </Col>}
        </Row>

        <Row>
            <Col xs={6} lg={siteSpecific(6, 4)} className={classNames("mb-2")}>
                <Label htmlFor="question-search-stage">Stage</Label>
                <StyledSelect
                    value={searchStages.map(s => itemise(s, stageLabelMap[s]))}
                    inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={getFilteredStageOptions()} onChange={selectOnChange(setSearchStages, true)}
                />
            </Col>
            <Col xs={6} lg={siteSpecific(6, 4)} className={classNames("mb-2")}>
                <Label htmlFor="question-search-difficulty">Difficulty</Label>
                <StyledSelect
                    value={searchDifficulties.map(d => itemise(d, difficultyLabelMap[d]))}
                    inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={DIFFICULTY_ICON_ITEM_OPTIONS} onChange={selectOnChange(setSearchDifficulties, true)}
                />
            </Col>
            {isAda && <Col xs={12} lg={4} className={classNames("mb-2")}>
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
            <Col className="d-flex flex-column col-12 col-xl-3 mt-2">

                {isPhy && <StyledCheckbox color="primary" checked={searchBookmarks} label={<span>Show bookmarked only</span>} onChange={e => {
                    startTransition(() => {
                        setSearchBookmarks(e.target.checked);
                    });
                }} />}

                {isPhy && isStaff(user) && <>
                    <StyledCheckbox color="primary" checked={searchFastTrack} label={<span>Show FastTrack only</span>} onChange={e => {
                        startTransition(() => {
                            setSearchFastTrack(e.target.checked);
                        });
                    }} />
                    <div className="section-divider" />
                </>}

                {isAda && <ul className="list-unstyled">
                    {groupBaseTagOptions.map((tag, index) => (
                        <CollapsibleList title={tag.label} asSubList
                            expanded={listState[`topics ${sublistDelimiter} ${tag.label}`]?.state}
                            toggle={() => listStateDispatch({type: "toggle", id: `topics ${sublistDelimiter} ${tag.label}`, focus: true})}
                            key={index} tag={"li"}
                        >
                            {tag.options.map((topic, index) => (
                                <li className={classNames("w-100 ps-3 py-1", {"bg-white": isAda})} style={{listStyle: "none"}} key={index}>
                                    <StyledCheckbox color="primary" checked={searchTopics.includes(topic.value)}
                                        onChange={() => setSearchTopics(s => s.includes(topic.value) ? s.filter(v => v !== topic.value) : [...s, topic.value])}
                                        label={<span>{topic.label}</span>} className="ps-3"/>
                                </li>
                            ))}
                        </CollapsibleList>
                    ))}
                </ul>}
                {isPhy && <div className="mb-2">
                    Topic
                    <HierarchyFilterTreeList root {...{
                        tier: 0, index: TAG_LEVEL.subject,
                        choices: topicChoices, selections: topicSelections, setSelections: setTopicSelections}}/>
                </div>}

                {/* required for sticky */}
                <div className="flex-grow-1" />
                {addSelectionsRow}

            </Col>


            <Col className="col-12 col-xl-9">

                <FilterSummary filterTags={filterTags} removeFilterTag={removeFilterTag} clearFilters={clearFilters} />

                <HorizontalScroller enabled className="my-4">
                    <Table bordered className="my-0">
                        <thead>
                            <tr>
                                <th className="w-5"> </th>
                                <SortItemHeader<SortOrder>
                                    className={siteSpecific("w-40", "w-30")}
                                    setOrder={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title")}
                                    defaultOrder={SortOrder.ASC}
                                    reverseOrder={SortOrder.DESC}
                                    currentOrder={questionsSort['title']}
                                    alignment="start"
                                >Question title</SortItemHeader>
                                <th className={siteSpecific("w-25", "w-20")}>Topic</th>
                                <th className="w-15">Stage</th>
                                <th className="w-15">Difficulty</th>
                                {isAda && <th className="w-15">Exam boards</th>}
                            </tr>
                        </thead>
                        <tbody>
                            <ShowLoadingQuery
                                query={searchQuestionsQuery}
                                placeholder={<tr><td colSpan={isAda ? 6 : 5}><Loading/></td></tr>}
                                defaultErrorTitle="Failed to load questions."
                                thenRender={({results: questions}) => {
                                    if (!questions) return <></>;
                                    const sortedQuestions = sortAndFilterBySearch(questions);
                                    return sortedQuestions?.map(question =>
                                        <GameboardBuilderTableRow
                                            key={`question-search-modal-row-${question.id}`}
                                            question={question}
                                            currentQuestions={modalQuestions}
                                            undoStack={undoStack}
                                            redoStack={redoStack}
                                            creationContext={creationContext}
                                        />
                                    );
                                }}
                            />
                        </tbody>
                    </Table>
                </HorizontalScroller>
            </Col>
        </Row>
    </>;
};
