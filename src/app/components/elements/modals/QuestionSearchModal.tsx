import React, {lazy, useEffect, useMemo, useReducer, useState} from "react";
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
    below,
    useDeviceSize,
    EXAM_BOARD, QUESTIONS_PER_GAMEBOARD
} from "../../../services";
import {ContentSummary, GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps, QuestionSearchQuery} from "../../../../IsaacAppTypes";
import {AudienceContext, ContentSummaryDTO, Difficulty, ExamBoard} from "../../../../IsaacApiTypes";
import {Loading} from "../../handlers/IsaacSpinner";
import {StyledSelect} from "../inputs/StyledSelect";
import { SortItemHeader } from "../SortableItemHeader";
import { Input, Row, Col, Label, Form, Table } from "reactstrap";
import classNames from "classnames";
import { HierarchyFilterTreeList } from "../svg/HierarchyFilter";
import { ChoiceTree, getChoiceTreeLeaves } from "../panels/QuestionFinderFilterPanel";
import { CollapsibleList } from "../CollapsibleList";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { updateTopicChoices, initialiseListState, listStateReducer } from "../../../services";
import { HorizontalScroller } from "../inputs/HorizontalScroller";
import { skipToken } from "@reduxjs/toolkit/query";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";

// Immediately load GameboardBuilderRow, but allow splitting
const importGameboardBuilderRow = import("../GameboardBuilderRow");
const GameboardBuilderRow = lazy(() => importGameboardBuilderRow);

const selectStyle = {
    className: "basic-multi-select", classNamePrefix: "select",
    menuPortalTarget: document.body, styles: {menuPortal: (base: object) => ({...base, zIndex: 9999})}
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
    const deviceSize = useDeviceSize();
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
    }, [userContext.contexts[0].examBoard]);

    const [searchBook, setSearchBook] = useState<string[]>([]);
    const isBookSearch = searchBook.length > 0;

    const creationContext: AudienceContext = useMemo(() => !isBookSearch ? {
        stage: searchStages.length > 0 ? searchStages : undefined,
        difficulty: searchDifficulties.length > 0 ? searchDifficulties : undefined,
        examBoard: searchExamBoards.length > 0 ? searchExamBoards : undefined,
    } : {}, [isBookSearch, searchStages, searchDifficulties, searchExamBoards]);

    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(false);

    const [questionsSort, setQuestionsSort] = useState<Record<string, SortOrder>>({});
    const [selectedQuestions, setSelectedQuestions] = useState<Map<string, ContentSummary>>(new Map(currentQuestions.selectedQuestions));
    const [questionOrder, setQuestionOrder] = useState([...currentQuestions.questionOrder]);

    const modalQuestions : GameboardBuilderQuestions = {selectedQuestions, questionOrder, setSelectedQuestions, setQuestionOrder};

    const user = useAppSelector((state: AppState) => state && state.user);

    const searchDebounce = useMemo(() => 
        debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], fasttrack: boolean, startIndex: number) => {
            // Clear front-end sorting so as not to override ElasticSearch's match ranking
            setQuestionsSort({});

            const isBookSearch = book.length > 0; // Tasty.
            if ([searchString, topics, book, stages, difficulties, examBoards].every(v => v.length === 0) && !fasttrack) {
                // Nothing to search for
                return setSearchParams(skipToken);
            }

            const tags = (isBookSearch ? book : [...([topics].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(",");

            setSearchParams({
                querySource: "gameboardBuilder",
                searchString: searchString || undefined,
                tags: tags || undefined,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoards.join(",") || undefined,
                fasttrack,
                startIndex,
                limit: 300
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
        searchDebounce(searchQuestionName, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, searchFastTrack, 0);
    },[searchDebounce, searchQuestionName, searchTopics, searchExamBoards, searchBook, searchFastTrack, searchStages, searchDifficulties]);

    const sortAndFilterBySearch = (questions: ContentSummaryDTO[]) => questions && sortQuestions(isBookSearch ? {title: SortOrder.ASC} : questionsSort, creationContext)(
        questions.filter(question => {
            const qIsPublic = searchResultIsPublic(question, user);
            if (isBookSearch) return qIsPublic;
            const qTopicsMatch =
                searchTopics.length === 0 ||
                (question.tags && question.tags.filter((tag) => searchTopics.includes(tag)).length > 0);

            return qIsPublic && qTopicsMatch;
        })
    );

    const addSelectionsRow = <div className="d-sm-flex flex-xl-column align-items-center mt-2">
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

    return <Row>
        <Col className="col-12 col-xl-3 mt-4">
            <Row>
                <Col className={isPhy && !isBookSearch ? "col-12 col-lg-6 col-xl-12" : ""}>
                    {isAda && <CollapsibleList 
                        title={<span className="ms-n3">Topic</span>} 
                        expanded={listState.topics.state} 
                        className="mb-3"
                        toggle={() => listStateDispatch({type: "toggle", id: "topics", focus: below["md"](deviceSize)})}
                    >
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
                                    </li>))}
                            </CollapsibleList>
                        ))}
                    </CollapsibleList>}
                    {isPhy && <div className="mb-2">
                        <Label htmlFor="question-search-book">Book</Label>
                        <StyledSelect
                            inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                            onChange={(e) => {
                                selectOnChange(setSearchBook, true)(e);
                                sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title");
                            }}
                            options={ISAAC_BOOKS.filter(b => !b.hidden).map(book => ({value: book.tag, label: book.shortTitle}))}
                        />
                    </div>}
                    <div className={`mb-2 ${isBookSearch ? "d-none" : ""}`}>
                        <Label htmlFor="question-search-stage">Stage</Label>
                        <StyledSelect
                            inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                            options={getFilteredStageOptions()} onChange={selectOnChange(setSearchStages, true)}
                        />
                    </div>
                    {isPhy && !isBookSearch && deviceSize !== "lg" && <div className="mb-2">
                        <Label htmlFor="question-search-topic">Topic</Label>
                        <HierarchyFilterTreeList root {...{
                            inputId: "question-search-topic", tier: 0, index: TAG_LEVEL.subject,
                            choices: topicChoices, selections: topicSelections, setSelections: setTopicSelections}}/>
                    </div>}
                    <div className={classNames("mb-2", {"d-none": isBookSearch})}>
                        <Label htmlFor="question-search-difficulty">Difficulty</Label>
                        <StyledSelect
                            inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                            options={DIFFICULTY_ICON_ITEM_OPTIONS} onChange={selectOnChange(setSearchDifficulties, true)}
                        />
                        {isAda && <>
                            <Label className="mt-2" htmlFor="question-search-exam-board">Exam Board</Label>
                            <StyledSelect
                                inputId="question-search-exam-board" isClearable isMulti placeholder="Any" {...selectStyle}
                                value={getFilteredExamBoardOptions({byStages: searchStages}).filter(o => searchExamBoards.includes(o.value))}
                                options={getFilteredExamBoardOptions({byStages: searchStages})}
                                onChange={(s: MultiValue<Item<ExamBoard>>) => selectOnChange(setSearchExamBoards, true)(s)}
                            />
                        </>}
                    </div>
                    <Label htmlFor="question-search-title">Search</Label>
                    <Input id="question-search-title" className="mb-3"
                        type="text"
                        placeholder={siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchQuestionName(e.target.value);
                        }}
                    />
                    {isPhy && isStaff(user) &&
                        <Form className="mb-2">
                            <Label check><input type="checkbox" checked={searchFastTrack} onChange={e => setSearchFastTrack(e.target.checked)} />{' '}Show FastTrack questions</Label>
                        </Form>}
                </Col>
                {isPhy && !isBookSearch && deviceSize === "lg" && <Col className="col-6">
                    <Label htmlFor="question-search-topic">Topic</Label>
                    <HierarchyFilterTreeList root {...{
                        inputId: "question-search-topic", tier: 0, index: TAG_LEVEL.subject,
                        choices: topicChoices, selections: topicSelections, setSelections: setTopicSelections}}/>
                </Col>}
            </Row>
            {addSelectionsRow}
        </Col>
        <Col className="col-12 col-xl-9">
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
                                    <GameboardBuilderRow
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
    </Row>;
};
