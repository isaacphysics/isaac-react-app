import React, {lazy, useCallback, useEffect, useState} from "react";
import {clearQuestionSearch, closeActiveModal, searchQuestions} from "../../../state/actions";
import * as RS from "reactstrap";
import {SortableTableHeader} from "../SortableTableHeader";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {debounce, isEqual} from "lodash";
import Select, {MultiValue} from "react-select";
import {
    groupTagSelectionsByParent,
    logEvent,
    sortQuestions
} from "../../../services/gameboardBuilder";
import tags from "../../../services/tags";
import {DIFFICULTY_ICON_ITEM_OPTIONS, EXAM_BOARD_NULL_OPTIONS, SortOrder, STAGE} from "../../../services/constants";
import {getFilteredExamBoardOptions, getFilteredStageOptions, useUserContext} from "../../../services/userContext";
import {searchResultIsPublic} from "../../../services/search";
import {isStaff} from "../../../services/user";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {ContentSummary} from "../../../../IsaacAppTypes";
import {AudienceContext, Difficulty, ExamBoard} from "../../../../IsaacApiTypes";
import {Item, selectOnChange} from "../../../services/select";
import {GroupBase} from "react-select/dist/declarations/src/types";
import {siteSpecific} from "../../../services/miscUtils";
const GameboardBuilderRow = lazy(() => import("../GameboardBuilderRow"));

const selectStyle = {
    className: "basic-multi-select", classNamePrefix: "select",
    menuPortalTarget: document.body, styles: {menuPortal: (base: object) => ({...base, zIndex: 9999})}
}

interface QuestionSearchModalProps {
    originalSelectedQuestions: Map<string, ContentSummary>;
    setOriginalSelectedQuestions: (m: Map<string, ContentSummary>) => void;
    originalQuestionOrder: string[];
    setOriginalQuestionOrder: (a: string[]) => void;
    eventLog: object[];
}
export const QuestionSearchModal = ({originalSelectedQuestions, setOriginalSelectedQuestions, originalQuestionOrder, setOriginalQuestionOrder, eventLog}: QuestionSearchModalProps) => {
    const dispatch = useDispatch();
    const userContext = useUserContext();

    const [searchTopics, setSearchTopics] = useState<string[]>([]);
    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchStages, setSearchStages] = useState<STAGE[]>([]);
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>([]);
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>([]);
    useEffect(function populateExamBoardFromUserContext() {
        if (!EXAM_BOARD_NULL_OPTIONS.has(userContext.examBoard)) setSearchExamBoards([userContext.examBoard]);
    }, [userContext.examBoard]);

    const [searchBook, setSearchBook] = useState<string[]>([]);
    const isBookSearch = searchBook.length > 0;

    const creationContext: AudienceContext = !isBookSearch ? {
        stage: searchStages.length > 0 ? searchStages : undefined,
        difficulty: searchDifficulties.length > 0 ? searchDifficulties : undefined,
        examBoard: searchExamBoards.length > 0 ? searchExamBoards : undefined,
    } : {};

    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(false);

    const [questionsSort, setQuestionsSort] = useState<Record<string, SortOrder>>({difficulty: SortOrder.ASC});
    const [selectedQuestions, setSelectedQuestions] = useState<Map<string, ContentSummary>>(new Map(originalSelectedQuestions));
    const [questionOrder, setQuestionOrder] = useState([...originalQuestionOrder]);

    const questions = useSelector((state: AppState) => state && state.gameboardEditorQuestions);
    const user = useSelector((state: AppState) => state && state.user);

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], fasttrack: boolean, startIndex: number) => {
            const isBookSearch = book.length > 0; // Tasty.
            if ([searchString, topics, book, stages, difficulties, examBoards].every(v => v.length === 0) && !fasttrack) {
                // Nothing to search for
                dispatch(clearQuestionSearch);
                return;
            }

            const tags = (isBookSearch ? book : [...([topics].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(" ")
            const examBoardString = examBoards.join(",");

            dispatch(searchQuestions({
                searchString: searchString,
                tags,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoardString,
                fasttrack,
                startIndex,
                limit: -1
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, examBoards, book, stages, difficulties, fasttrack, startIndex});
        }, 250),
        []
    );

    const sortableTableHeaderUpdateState = (sortState: { [s: string]: string }, setSortState: React.Dispatch<React.SetStateAction<{}>>, key: string) => (order: string) => {
        const newSortState = {...sortState};
        newSortState[key] = order;
        setSortState(newSortState);
    };

    const tagOptions: { options: Item<string>[]; label: string }[] = SITE_SUBJECT === SITE.PHY ? tags.allTags.map(groupTagSelectionsByParent) : tags.allSubcategoryTags.map(groupTagSelectionsByParent);
    const groupBaseTagOptions: GroupBase<Item<string>>[] = tagOptions;

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, searchFastTrack, 0);
    },[searchDebounce, searchQuestionName, searchTopics, searchExamBoards, searchBook, searchFastTrack, searchStages, searchDifficulties]);

    const addSelectionsRow = <div className="d-lg-flex align-items-baseline">
        <div className="flex-grow-1 mb-1">
            <strong className={selectedQuestions.size > 10 ? "text-danger" : ""}>
                {{
                    [SITE.PHY]: `${selectedQuestions.size} Question${selectedQuestions.size !== 1 ? "s" : ""} Selected`,
                    [SITE.CS]: `${selectedQuestions.size} question${selectedQuestions.size !== 1 ? "s" : ""} selected`
                }[SITE_SUBJECT]}
            </strong>
        </div>
        <div>
            <RS.Input
                type="button"
                value={{[SITE.PHY]: "Add Selections to Gameboard", [SITE.CS]: "Add selections to gameboard"}[SITE_SUBJECT]}
                disabled={isEqual(new Set(originalSelectedQuestions.keys()), new Set(selectedQuestions.keys()))}
                className={"btn btn-block btn-secondary border-0"}
                onClick={() => {
                    setOriginalSelectedQuestions(selectedQuestions);
                    setOriginalQuestionOrder(questionOrder);
                    dispatch(closeActiveModal());
                }}
            />
        </div>
    </div>;

    return <div className="mb-4">
        <RS.Row>
            {SITE_SUBJECT === SITE.PHY && <RS.Col lg={3} className="text-wrap my-2">
                <RS.Label htmlFor="question-search-book">Book</RS.Label>
                <Select
                    inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                    onChange={(e) => {
                        selectOnChange(setSearchBook, true)(e);
                        sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title");
                    }}
                    options={[
                        {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
                        {value: "phys_book_gcse", label: "GCSE Physics"},
                        {value: "maths_book", label: "Pre-Uni Maths"},
                        {value: "maths_book_gcse", label: "GCSE Maths"},
                        {value: "chemistry_16", label: "A-Level Physical Chemistry"},
                        {value: "phys_book_step_up", label: "Step Up to GCSE Physics"}
                    ]}
                />
            </RS.Col>}
            <RS.Col lg={SITE_SUBJECT === SITE.CS ? 12 : 9} className={`text-wrap mt-2 ${isBookSearch ? "d-none" : ""}`}>
                <RS.Label htmlFor="question-search-topic">Topic</RS.Label>
                <Select
                    inputId="question-search-topic" isMulti placeholder="Any" {...selectStyle}
                    options={groupBaseTagOptions} onChange={(x : readonly Item<string>[], {action}) => {
                        selectOnChange(setSearchTopics, true)(x)
                    }}
                />
            </RS.Col>
        </RS.Row>
        <RS.Row className={isBookSearch ? "d-none" : ""}>
            <RS.Col lg={6} className={`text-wrap my-2`}>
                <RS.Label htmlFor="question-search-stage">Stage</RS.Label>
                <Select
                    inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={getFilteredStageOptions()} onChange={selectOnChange(setSearchStages, true)}
                />
            </RS.Col>
            <RS.Col lg={6} className={`text-wrap my-2 ${isBookSearch ? "d-none" : ""}`}>
                <RS.Label htmlFor="question-search-difficulty">Difficulty</RS.Label>
                <Select
                    inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={DIFFICULTY_ICON_ITEM_OPTIONS} onChange={selectOnChange(setSearchDifficulties, true)}
                />
            </RS.Col>
            {SITE_SUBJECT === SITE.CS && <RS.Col lg={6} className={`text-wrap my-2`}>
                <RS.Label htmlFor="question-search-exam-board">Exam Board</RS.Label>
                <Select
                    inputId="question-search-exam-board" isClearable isMulti placeholder="Any" {...selectStyle}
                    value={getFilteredExamBoardOptions({byStages: searchStages}).filter(o => searchExamBoards.includes(o.value))}
                    options={getFilteredExamBoardOptions({byStages: searchStages})}
                    onChange={(s: MultiValue<Item<ExamBoard>>) => selectOnChange(setSearchExamBoards, true)(s)}
                />
            </RS.Col>}
        </RS.Row>
        <RS.Row>
            {SITE_SUBJECT === SITE.PHY && isStaff(user) && <RS.Col className="text-wrap mb-2">
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
                    placeholder={{[SITE.CS]: "e.g. Creating an AST", [SITE.PHY]: "e.g. Man vs. Horse"}[SITE_SUBJECT]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </RS.Col>
        </RS.Row>
        <div className="mt-4">
            {addSelectionsRow}
        </div>
        <RS.Table bordered responsive className="mt-4">
            <thead>
                <tr>
                    <th className="w-5"> </th>
                    <SortableTableHeader
                        className="w-40" title="Question title"
                        updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title")}
                        enabled={!isBookSearch}
                    />
                    <th className="w-25">Topic</th>
                    <th className="w-15">Stage</th>
                    <th className={siteSpecific("w-15","w-10")}>Difficulty</th>
                    {SITE_SUBJECT === SITE.CS && <th className="w-5">Exam boards</th>}
                </tr>
            </thead>
            <tbody>
                {
                    questions &&
                    sortQuestions(isBookSearch ? {title: SortOrder.ASC} : questionsSort, creationContext)(
                        questions.filter(question => {
                            const qIsPublic = searchResultIsPublic(question, user);
                            if (isBookSearch) return qIsPublic;
                            const qTopicsMatch =
                                searchTopics.length == 0 ||
                                (question.tags && question.tags.filter((tag) => searchTopics.includes(tag)).length > 0);

                            return qIsPublic && qTopicsMatch;
                        })
                    ).map(question =>
                        <GameboardBuilderRow
                            key={`question-search-modal-row-${question.id}`} question={question}
                            selectedQuestions={selectedQuestions} setSelectedQuestions={setSelectedQuestions}
                            questionOrder={questionOrder} setQuestionOrder={setQuestionOrder} creationContext={creationContext}
                        />
                    )
                }
            </tbody>
        </RS.Table>
        {questions && questions.length > 5 && <div className="mt-2">
            {addSelectionsRow}
        </div>}
    </div>;
};
