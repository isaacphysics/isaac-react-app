import React, {lazy, Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {
    AppState,
    clearQuestionSearch,
    closeActiveModal,
    searchQuestions,
    useAppDispatch,
    useAppSelector
} from "../../../state";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
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
    searchResultIsPublic,
    selectOnChange,
    siteSpecific,
    SortOrder,
    sortQuestions,
    STAGE,
    useUserViewingContext,
    ISAAC_BOOKS
} from "../../../services";
import {ContentSummary, GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps} from "../../../../IsaacAppTypes";
import {AudienceContext, Difficulty, ExamBoard} from "../../../../IsaacApiTypes";
import {GroupBase} from "react-select/dist/declarations/src/types";
import {Loading} from "../../handlers/IsaacSpinner";
import {StyledSelect} from "../inputs/StyledSelect";
import { SortItemHeader } from "../SortableItemHeader";
import { Input, Row, Col, Label, Form, Table } from "reactstrap";
import classNames from "classnames";

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

    const [searchTopics, setSearchTopics] = useState<string[]>([]);
    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchStages, setSearchStages] = useState<STAGE[]>([]);
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>([]);
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>([]);
    useEffect(function populateExamBoardFromUserContext() {
        if (!EXAM_BOARD_NULL_OPTIONS.includes(userContext.examBoard)) setSearchExamBoards([userContext.examBoard]);
    }, [userContext.examBoard]);

    const [isSearching, setIsSearching] = useState(false);

    const [searchBook, setSearchBook] = useState<string[]>([]);
    const isBookSearch = searchBook.length > 0;

    const creationContext: AudienceContext = !isBookSearch ? {
        stage: searchStages.length > 0 ? searchStages : undefined,
        difficulty: searchDifficulties.length > 0 ? searchDifficulties : undefined,
        examBoard: searchExamBoards.length > 0 ? searchExamBoards : undefined,
    } : {};

    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(false);

    const [questionsSort, setQuestionsSort] = useState<Record<string, SortOrder>>({});
    const [selectedQuestions, setSelectedQuestions] = useState<Map<string, ContentSummary>>(new Map(currentQuestions.selectedQuestions));
    const [questionOrder, setQuestionOrder] = useState([...currentQuestions.questionOrder]);

    const modalQuestions : GameboardBuilderQuestions = {selectedQuestions, questionOrder, setSelectedQuestions, setQuestionOrder};

    const {results: questions} = useAppSelector((state: AppState) => state && state.questionSearchResult) || {};
    const user = useAppSelector((state: AppState) => state && state.user);

    useEffect(() => {
        setIsSearching(false);
    }, [questions]);

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], fasttrack: boolean, startIndex: number) => {
            // Clear front-end sorting so as not to override ElasticSearch's match ranking
            setQuestionsSort({});

            const isBookSearch = book.length > 0; // Tasty.
            if ([searchString, topics, book, stages, difficulties, examBoards].every(v => v.length === 0) && !fasttrack) {
                // Nothing to search for
                dispatch(clearQuestionSearch);
                return;
            }

            const tags = (isBookSearch ? book : [...([topics].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(",");

            setIsSearching(true);

            dispatch(searchQuestions({
                searchString: searchString || undefined,
                tags: tags || undefined,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoards.join(",") || undefined,
                fasttrack,
                startIndex,
                limit: 300
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, examBoards, book, stages, difficulties, fasttrack, startIndex});
        }, 250),
        []
    );

    const sortableTableHeaderUpdateState = (sortState: Record<string, SortOrder>, setSortState: React.Dispatch<React.SetStateAction<Record<string, SortOrder>>>, key: string) => (order: SortOrder) => {
        const newSortState = {...sortState};
        newSortState[key] = order;
        setSortState(newSortState);
    };

    const tagOptions: { options: Item<string>[]; label: string }[] = isPhy ? tags.allTags.map(groupTagSelectionsByParent) : tags.allSubcategoryTags.map(groupTagSelectionsByParent);
    const groupBaseTagOptions: GroupBase<Item<string>>[] = tagOptions;

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, searchFastTrack, 0);
    },[searchDebounce, searchQuestionName, searchTopics, searchExamBoards, searchBook, searchFastTrack, searchStages, searchDifficulties]);

    const sortedQuestions = useMemo(() => {
        return questions && sortQuestions(isBookSearch ? {title: SortOrder.ASC} : questionsSort, creationContext)(
            questions.filter(question => {
                const qIsPublic = searchResultIsPublic(question, user);
                if (isBookSearch) return qIsPublic;
                const qTopicsMatch =
                    searchTopics.length === 0 ||
                    (question.tags && question.tags.filter((tag) => searchTopics.includes(tag)).length > 0);

                return qIsPublic && qTopicsMatch;
            })
        );
    }, [questions, user, searchTopics, isBookSearch, questionsSort, creationContext]);

    const addSelectionsRow = <div className="d-lg-flex align-items-baseline">
        <div className="flex-grow-1 mb-1">
            <strong className={selectedQuestions.size > 10 ? "text-danger" : ""}>
                {siteSpecific(
                    `${selectedQuestions.size} Question${selectedQuestions.size !== 1 ? "s" : ""} Selected`,
                    `${selectedQuestions.size} question${selectedQuestions.size !== 1 ? "s" : ""} selected`
                )}
            </strong>
        </div>
        <div>
            <Input
                type="button"
                value={siteSpecific("Add Selections to Question Deck", "Add selections to quiz")}
                disabled={isEqual(new Set(modalQuestions.selectedQuestions.keys()), new Set(currentQuestions.selectedQuestions.keys()))}
                className={classNames("btn w-100", siteSpecific("btn-keyline", "btn-secondary border-0"))}
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

    return <div className="mb-4">
        <Row>
            {isPhy && <Col lg={3} className="text-wrap my-2">
                <Label htmlFor="question-search-book">Book</Label>
                <StyledSelect
                    inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                    onChange={(e) => {
                        selectOnChange(setSearchBook, true)(e);
                        sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title");
                    }}
                    options={ISAAC_BOOKS.filter(b => !b.hidden).map(book => ({value: book.tag, label: book.shortTitle}))}
                />
            </Col>}
            <Col lg={siteSpecific(9, 12)} className={`text-wrap mt-2 ${isBookSearch ? "d-none" : ""}`}>
                <Label htmlFor="question-search-topic">Topic</Label>
                <StyledSelect
                    inputId="question-search-topic" isMulti placeholder="Any" {...selectStyle}
                    options={groupBaseTagOptions} onChange={(x : readonly Item<string>[], {action: _action}) => {
                        selectOnChange(setSearchTopics, true)(x);
                    }}
                />
            </Col>
        </Row>
        <Row className={isBookSearch ? "d-none" : ""}>
            <Col lg={6} className={`text-wrap my-2`}>
                <Label htmlFor="question-search-stage">Stage</Label>
                <StyledSelect
                    inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={getFilteredStageOptions()} onChange={selectOnChange(setSearchStages, true)}
                />
            </Col>
            <Col lg={6} className={`text-wrap my-2 ${isBookSearch ? "d-none" : ""}`}>
                <Label htmlFor="question-search-difficulty">Difficulty</Label>
                <StyledSelect
                    inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={DIFFICULTY_ICON_ITEM_OPTIONS} onChange={selectOnChange(setSearchDifficulties, true)}
                />
            </Col>
            {isAda && <Col lg={6} className={`text-wrap my-2`}>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </Col>
        </Row>
        <div className="mt-4">
            {addSelectionsRow}
        </div>
        <Suspense fallback={<Loading/>}>
            <Table bordered responsive className="mt-4">
                <thead>
                    <tr className="search-modal-table-header">
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
                    {isSearching ? <tr><td colSpan={isAda ? 6 : 5}><Loading/></td></tr> : sortedQuestions?.map(question =>
                        <GameboardBuilderRow
                            key={`question-search-modal-row-${question.id}`} 
                            question={question}
                            currentQuestions={modalQuestions}
                            undoStack={undoStack}
                            redoStack={redoStack}
                            creationContext={creationContext}
                        />
                    )}
                </tbody>
            </Table>
        </Suspense>
        {questions && questions.length > 5 && <div className="mt-2">
            {addSelectionsRow}
        </div>}
    </div>;
};
