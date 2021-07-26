import React, {useCallback, useEffect, useState} from "react";
import {clearQuestionSearch, closeActiveModal, searchQuestions} from "../../../state/actions";
import * as RS from "reactstrap";
import {SortableTableHeader} from "../SortableTableHeader";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {debounce, isEqual, range} from "lodash";
import Select from "react-select";
import {
    convertExamBoardToOption,
    groupTagSelectionsByParent,
    logEvent,
    multiSelectOnChange,
    selectOnChange,
    sortQuestions
} from "../../../services/gameboardBuilder";
import tags from "../../../services/tags";
import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {
    DIFFICULTY_ITEM_OPTIONS,
    EXAM_BOARD,
    EXAM_BOARDS_OLD,
    examBoardTagMap,
    SortOrder,
    STAGE,
} from "../../../services/constants";
import {GameboardBuilderRow} from "../GameboardBuilderRow";
import {getFilteredExamBoardOptions, getFilteredStages, useUserContext} from "../../../services/userContext";
import {searchResultIsPublic} from "../../../services/search";
import {isStaff} from "../../../services/user";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";

const selectStyle = {
    className: "basic-multi-select", classNamePrefix: "select",
    menuPortalTarget: document.body, styles: {menuPortal: (base: object) => ({...base, zIndex: 9999})}
}

interface QuestionSearchModalProps {
    originalSelectedQuestions: Map<string, ContentSummaryDTO>;
    setOriginalSelectedQuestions: (m: Map<string, ContentSummaryDTO>) => void;
    originalQuestionOrder: string[];
    setOriginalQuestionOrder: (a: string[]) => void;
    eventLog: object[];
}
export const QuestionSearchModal = ({originalSelectedQuestions, setOriginalSelectedQuestions, originalQuestionOrder, setOriginalQuestionOrder, eventLog}: QuestionSearchModalProps) => {
    const dispatch = useDispatch();
    const {BETA_FEATURE: betaFeature} = useSelector((state: AppState) => state?.userPreferences) || {};
    const audienceContextBeta = betaFeature?.AUDIENCE_CONTEXT || false;

    const [searchTopics, setSearchTopics] = useState<string[]>([]);

    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchLevels, setSearchLevels] = useState<string[]>([]);
    const [searchExamBoards, setSearchExamBoards] = useState<string[]>([]);
    const [searchStages, setSearchStages] = useState<STAGE[]>([]);
    const [searchDifficulties, setSearchDifficulties] = useState<string[]>([]);

    const [searchBook, setSearchBook] = useState<string[]>([]);
    const isBookSearch = searchBook.length > 0;

    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(false);

    const [questionsSort, setQuestionsSort] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState(new Map(originalSelectedQuestions));
    const [questionOrder, setQuestionOrder] = useState([...originalQuestionOrder]);

    const questions = useSelector((state: AppState) => state && state.gameboardEditorQuestions);
    const user = useSelector((state: AppState) => state && state.user);
    const {examBoard} = useUserContext();

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], levels: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], fasttrack: boolean, startIndex: number) => {
            const isBookSearch = book.length > 0; // Tasty.
            if ([searchString, topics, levels, book, stages, difficulties, examBoards].every(v => v.length === 0) && !fasttrack) {
                // Nothing to search for
                dispatch(clearQuestionSearch);
                return;
            }

            let tags;
            let examBoardString;
            if (!audienceContextBeta) {
                tags = (isBookSearch ? book : [...([topics, examBoards].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(" ");
            } else {
                tags = (isBookSearch ? book : [...([topics].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(" ")
                examBoardString = examBoards.join(",");
            }

            dispatch(searchQuestions({
                searchString: searchString,
                // N.B. This endpoint claims to support multiple levels, but it doesn't seem to work, so we restrict the select below to only pick one level.
                levels: !isBookSearch && levels.length > 0 ? levels.join(",") : undefined,
                tags,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoardString,
                fasttrack,
                startIndex,
                limit: -1
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, levels, examBoards, book, stages, difficulties, fasttrack, startIndex});
        }, 250),
        []
    );

    const sortableTableHeaderUpdateState = (sortState: { [s: string]: string }, setSortState: React.Dispatch<React.SetStateAction<{}>>, key: string) => (order: string) => {
        const newSortState = {...sortState};
        newSortState[key] = order;
        setSortState(newSortState);
    };

    const tagOptions = SITE_SUBJECT === SITE.PHY ? tags.allTags.map(groupTagSelectionsByParent) :
        tags.allSubcategoryTags.map(groupTagSelectionsByParent);

    useEffect(() => {
        if (!audienceContextBeta) {
            setSearchExamBoards([examBoardTagMap[examBoard]].filter(tag => !!tag));
        }
    }, [user, examBoard]);

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTopics, searchLevels, searchExamBoards, searchBook, searchStages, searchDifficulties, searchFastTrack, 0);
    },[searchDebounce, searchQuestionName, searchTopics, searchLevels, searchExamBoards, searchBook, searchFastTrack, searchStages, searchDifficulties]);

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
                        selectOnChange(setSearchBook)(e);
                        sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title");
                    }}
                    options={[
                        {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
                        {value: "phys_book_gcse", label: "GCSE Physics"},
                        {value: "maths_book", label: "Pre-Uni Maths"},
                        {value: "chemistry_16", label: "A-Level Physical Chemistry"},
                        {value: "physics_skills_14", label: "A Level Physics (2nd Edition - Old)"},
                    ]}
                />
            </RS.Col>}
            {!isBookSearch && <RS.Col lg={audienceContextBeta ? SITE_SUBJECT === SITE.CS ? 12 : 9 : 6} className="text-wrap mt-2">
                <RS.Label htmlFor="question-search-topic">Topic</RS.Label>
                <Select
                    inputId="question-search-topic" isMulti placeholder="Any" {...selectStyle}
                    options={tagOptions} onChange={multiSelectOnChange(setSearchTopics)}
                />
            </RS.Col>}
            {!audienceContextBeta && <React.Fragment>
                {SITE_SUBJECT === SITE.CS && <RS.Col lg={6} className="text-wrap my-2">
                    <RS.Label htmlFor="question-search-exam-board">Exam board</RS.Label>
                    <Select
                        inputId="question-search-exam-board" isMulti placeholder="Any" {...selectStyle}
                        options={
                            Object.values(EXAM_BOARD)
                                .filter(e => EXAM_BOARDS_OLD.has(e))
                                .map(name => ({value: examBoardTagMap[name], label: name}))
                        }
                        value={searchExamBoards.map(convertExamBoardToOption)}
                        onChange={multiSelectOnChange(setSearchExamBoards)}
                    />
                </RS.Col>}
                {SITE_SUBJECT === SITE.PHY && !isBookSearch && <RS.Col lg={3} className={`text-wrap my-2`}>
                    <RS.Label htmlFor="question-search-level">Level</RS.Label>
                    <Select
                        inputId="question-search-level" isClearable placeholder="Any" {...selectStyle}
                        onChange={selectOnChange(setSearchLevels)}
                        options={[
                            ...(range(1,6).map((i) => {return { value: i.toString(), label: i.toString() }})),
                            {value: '6', label: '6 (Post A-Level)'}]}
                    />
                </RS.Col>}
            </React.Fragment>}
        </RS.Row>
        {audienceContextBeta && !isBookSearch && <RS.Row>
            <RS.Col lg={6} className={`text-wrap my-2`}>
                <RS.Label htmlFor="question-search-stage">Stage</RS.Label>
                <Select
                    inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={getFilteredStages(false)} onChange={multiSelectOnChange(setSearchStages)}
                />
            </RS.Col>
            {SITE_SUBJECT === SITE.PHY && !isBookSearch && <RS.Col lg={6} className={`text-wrap my-2`}>
                <RS.Label htmlFor="question-search-difficulty">Difficulty</RS.Label>
                <Select
                    inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={DIFFICULTY_ITEM_OPTIONS} onChange={multiSelectOnChange(setSearchDifficulties)}
                />
            </RS.Col>}
            {SITE_SUBJECT === SITE.CS && <RS.Col lg={6} className={`text-wrap my-2`}>
                <RS.Label htmlFor="question-search-exam-board">Exam Board</RS.Label>
                <Select
                    inputId="question-search-exam-board" isClearable isMulti placeholder="Any" {...selectStyle}
                    options={getFilteredExamBoardOptions(searchStages, false, audienceContextBeta)}
                    onChange={multiSelectOnChange(setSearchExamBoards)}
                />
            </RS.Col>}
        </RS.Row>}
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
                    {SITE_SUBJECT === SITE.PHY && <SortableTableHeader
                        className="w-15" title="Level"
                        updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "level")}
                        enabled={!isBookSearch}
                    />}
                    {SITE_SUBJECT === SITE.CS && <th className="w-15">Exam boards</th>}
                </tr>
            </thead>
            <tbody>
                {
                    questions && sortQuestions(searchBook.length === 0 ? questionsSort : {title: SortOrder.ASC})(questions.filter((question) => {
                        let qIsPublic = searchResultIsPublic(question, user);
                        if (isBookSearch) return qIsPublic;
                        let qLevelsMatch = (searchLevels.length == 0 || (question.level && searchLevels.includes(question.level.toString())));
                        let qExamboardsMatch = audienceContextBeta || (searchExamBoards.length == 0 || (question.tags && question.tags.filter((tag) => searchExamBoards.includes(tag)).length > 0));
                        let qTopicsMatch = (searchTopics.length == 0 || (question.tags && question.tags.filter((tag) => searchTopics.includes(tag)).length > 0));

                        return qIsPublic && qLevelsMatch && qExamboardsMatch && qTopicsMatch;
                    })).map((question) =>
                        <GameboardBuilderRow
                            key={`question-search-modal-row-${question.id}`} question={question}
                            selectedQuestions={selectedQuestions} setSelectedQuestions={setSelectedQuestions}
                            questionOrder={questionOrder} setQuestionOrder={setQuestionOrder}
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
