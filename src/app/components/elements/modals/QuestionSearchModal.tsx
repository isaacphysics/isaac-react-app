import React, {lazy, Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {
    AppState,
    clearQuestionSearch,
    closeActiveModal,
    searchQuestions,
    useAppDispatch,
    useAppSelector
} from "../../../state";
import * as RS from "reactstrap";
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
    useUserViewingContext
} from "../../../services";
import {ContentSummary, GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps} from "../../../../IsaacAppTypes";
import {AudienceContext, Difficulty, ExamBoard} from "../../../../IsaacApiTypes";
import {GroupBase} from "react-select/dist/declarations/src/types";
import {Loading} from "../../handlers/IsaacSpinner";
import {StyledSelect} from "../inputs/StyledSelect";
import { SortItemHeader } from "../SortableItemHeader";

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

            const tags = (isBookSearch ? book : [...([topics].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(" ");
            const examBoardString = examBoards.join(",");

            dispatch(searchQuestions({
                searchString: searchString,
                tags,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoardString,
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
            <RS.Input
                type="button"
                value={siteSpecific("Add Selections to Gameboard", "Add selections to quiz")}
                disabled={isEqual(new Set(modalQuestions.selectedQuestions.keys()), new Set(currentQuestions.selectedQuestions.keys()))}
                className={"btn btn-block btn-secondary border-0"}
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
        <RS.Row>
            {isPhy && <RS.Col lg={3} className="text-wrap my-2">
                <RS.Label htmlFor="question-search-book">Book</RS.Label>
                <StyledSelect
                    inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                    onChange={(e) => {
                        selectOnChange(setSearchBook, true)(e);
                        sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title");
                    }}
                    options={[
                        {value: "phys_book_step_up", label: "Step Up to GCSE Physics"},
                        {value: "phys_book_gcse", label: "GCSE Physics"},
                        {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
                        {value: "physics_linking_concepts", label: "Linking Concepts in Pre-Uni Physics"},
                        {value: "maths_book_gcse", label: "GCSE Maths"},
                        {value: "maths_book_2e", label: "Pre-Uni Maths (2nd edition)"},
                        {value: "maths_book", label: "Pre-Uni Maths (1st edition)"},
                        {value: "chemistry_16", label: "A-Level Physical Chemistry"}
                    ]}
                />
            </RS.Col>}
            <RS.Col lg={siteSpecific(9, 12)} className={`text-wrap mt-2 ${isBookSearch ? "d-none" : ""}`}>
                <RS.Label htmlFor="question-search-topic">Topic</RS.Label>
                <StyledSelect
                    inputId="question-search-topic" isMulti placeholder="Any" {...selectStyle}
                    options={groupBaseTagOptions} onChange={(x : readonly Item<string>[], {action: _action}) => {
                        selectOnChange(setSearchTopics, true)(x);
                    }}
                />
            </RS.Col>
        </RS.Row>
        <RS.Row className={isBookSearch ? "d-none" : ""}>
            <RS.Col lg={6} className={`text-wrap my-2`}>
                <RS.Label htmlFor="question-search-stage">Stage</RS.Label>
                <StyledSelect
                    inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={getFilteredStageOptions()} onChange={selectOnChange(setSearchStages, true)}
                />
            </RS.Col>
            <RS.Col lg={6} className={`text-wrap my-2 ${isBookSearch ? "d-none" : ""}`}>
                <RS.Label htmlFor="question-search-difficulty">Difficulty</RS.Label>
                <StyledSelect
                    inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={DIFFICULTY_ICON_ITEM_OPTIONS} onChange={selectOnChange(setSearchDifficulties, true)}
                />
            </RS.Col>
            {isAda && <RS.Col lg={6} className={`text-wrap my-2`}>
                <RS.Label htmlFor="question-search-exam-board">Exam Board</RS.Label>
                <StyledSelect
                    inputId="question-search-exam-board" isClearable isMulti placeholder="Any" {...selectStyle}
                    value={getFilteredExamBoardOptions({byStages: searchStages}).filter(o => searchExamBoards.includes(o.value))}
                    options={getFilteredExamBoardOptions({byStages: searchStages})}
                    onChange={(s: MultiValue<Item<ExamBoard>>) => selectOnChange(setSearchExamBoards, true)(s)}
                />
            </RS.Col>}
        </RS.Row>
        <RS.Row>
            {isPhy && isStaff(user) && <RS.Col className="text-wrap mb-2">
                <RS.Form>
                    <RS.Label check><input type="checkbox" checked={searchFastTrack} onChange={e => setSearchFastTrack(e.target.checked)} />{' '}Show FastTrack questions</RS.Label>
                </RS.Form>
            </RS.Col>}
        </RS.Row>
        <RS.Row>
            <RS.Col lg={12} className="text-wrap mt-2">
                <RS.Label htmlFor="question-search-title">Search</RS.Label>
                <RS.Input id="question-search-title"
                    type="text"
                    placeholder={siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </RS.Col>
        </RS.Row>
        <div className="mt-4">
            {addSelectionsRow}
        </div>
        <Suspense fallback={<Loading/>}>
            <RS.Table bordered responsive className="mt-4">
                <thead>
                    <tr className="search-modal-table-header">
                        <th className="w-5"> </th>
                        <SortItemHeader
                            className={siteSpecific("w-40", "w-30")}
                            setOrder={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title")}
                            defaultOrder={SortOrder.ASC as SortOrder}
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
                    {sortedQuestions?.map(question =>
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
            </RS.Table>
        </Suspense>
        {questions && questions.length > 5 && <div className="mt-2">
            {addSelectionsRow}
        </div>}
    </div>;
};
