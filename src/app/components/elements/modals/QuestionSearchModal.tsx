import React, {useCallback, useEffect, useState} from "react";
import {clearQuestionSearch, closeActiveModal, searchQuestions} from "../../../state/actions";
import * as RS from "reactstrap";
import {SortableTableHeader} from "../SortableTableHeader";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {debounce, range} from "lodash";
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
import {EXAM_BOARD, examBoardTagMap, SortOrder} from "../../../services/constants";
import {GameboardBuilderRow} from "../GameboardBuilderRow";
import {useCurrentExamBoard} from "../../../services/examBoard";
import {searchResultIsPublic} from "../../../services/search";
import {isStaff} from "../../../services/user";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";

interface QuestionSearchModalProps {
    originalSelectedQuestions: Map<string, ContentSummaryDTO>;
    setOriginalSelectedQuestions: (m: Map<string, ContentSummaryDTO>) => void;
    originalQuestionOrder: string[];
    setOriginalQuestionOrder: (a: string[]) => void;
    eventLog: object[];
}

export const QuestionSearchModal = ({originalSelectedQuestions, setOriginalSelectedQuestions, originalQuestionOrder, setOriginalQuestionOrder, eventLog}: QuestionSearchModalProps) => {
    const dispatch = useDispatch();

    const [searchTopics, setSearchTopics] = useState<string[]>([]);

    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchLevels, setSearchLevels] = useState<string[]>([]);
    const [searchExamBoards, setSearchExamBoards] = useState<string[]>([]);

    const [searchBook, setSearchBook] = useState<string[]>([]);
    const isBookSearch = searchBook.length > 0;

    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(false);

    const [questionsSort, setQuestionsSort] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState(new Map(originalSelectedQuestions));
    const [questionOrder, setQuestionOrder] = useState([...originalQuestionOrder]);

    const questions = useSelector((state: AppState) => state && state.gameboardEditorQuestions);
    const user = useSelector((state: AppState) => state && state.user);
    const examBoard = useCurrentExamBoard();

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], levels: string[], examBoard: string[], book: string[], fasttrack: boolean, startIndex: number) => {
            const isBookSearch = book.length > 0; // Tasty.
            if (searchString.length === 0 && topics.length === 0 && levels.length === 0 && book.length === 0 && !fasttrack) {
                // Nothing to search for
                dispatch(clearQuestionSearch);
                return;
            }
            dispatch(searchQuestions({
                searchString: searchString,
                // N.B. This endpoint claims to support multiple levels, but it doesn't seem to work, so we restrict the select below to only pick one level.
                levels: !isBookSearch && levels.length > 0 ? levels.join(",") : undefined,
                tags: (isBookSearch ? book : [...([topics, examBoard].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(" "),
                fasttrack,
                startIndex,
                limit: -1
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, levels, examBoard, book, fasttrack, startIndex});
        }, 250),
        []
    );

    const sortableTableHeaderUpdateState = (sortState: { [s: string]: string }, setSortState: React.Dispatch<React.SetStateAction<{}>>, key: string) => (order: string) => {
        const newSortState = {...sortState};
        newSortState[key] = order;
        setSortState(newSortState);
    };

    useEffect(() => {
        setSearchExamBoards([examBoardTagMap[examBoard]].filter(tag => !!tag));
    }, [user, examBoard]);

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTopics, searchLevels, searchExamBoards, searchBook, searchFastTrack, 0);
    },[searchDebounce, searchQuestionName, searchTopics, searchLevels, searchExamBoards, searchBook, searchFastTrack]);

    return <div>
        <div className="row">
            {SITE_SUBJECT === SITE.PHY && <div className="text-wrap col-lg-3 my-2">
                <RS.Label htmlFor="question-search-book">Book</RS.Label>
                <Select inputId="question-search-book"
                    options={[
                        {value: "physics_skills_14", label: "A Level Physics (Pre 3rd Edition)"},
                        {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
                        {value: "phys_book_gcse", label: "GCSE Physics"},
                        {value: "maths_book", label: "Pre-Uni Maths"},
                        {value: "chemistry_16", label: "A-Level Physical Chemistry"},
                    ]}
                    name="books"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="None"
                    onChange={(e) => {
                        selectOnChange(setSearchBook)(e);
                        sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title");
                    }}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{menuPortal: base => ({...base, zIndex: 9999})}}
                />
            </div>}
            {!isBookSearch && <div className="text-wrap col-lg-6 mt-2">
                <RS.Label htmlFor="question-search-topic">Topic</RS.Label>
                <Select inputId="question-search-topic"
                    isMulti
                    options={tags.allTags.map(groupTagSelectionsByParent)}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Any"
                    onChange={multiSelectOnChange(setSearchTopics)}
                    menuPortalTarget={document.body}
                    styles={{menuPortal: base => ({...base, zIndex: 9999})}}
                />
            </div>}
            {SITE_SUBJECT === SITE.CS && <div className="text-wrap my-2 col-lg-6">
                <RS.Label htmlFor="question-search-exam-board">Exam board</RS.Label>
                <Select inputId="question-search-exam-board"
                    isMulti
                    options={Object.keys(EXAM_BOARD).map((name) => {
                        return {value: examBoardTagMap[name], label: name};
                    })}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Any"
                    value={searchExamBoards.map(convertExamBoardToOption)}
                    onChange={multiSelectOnChange(setSearchExamBoards)}
                    menuPortalTarget={document.body}
                    styles={{menuPortal: base => ({...base, zIndex: 9999})}}
                />
            </div>}
            {SITE_SUBJECT === SITE.PHY && <div className={`text-wrap col-lg-3 my-2 ${isBookSearch ? "d-none" : ""}`}>
                <RS.Label htmlFor="question-search-level">Level</RS.Label>
                <Select inputId="question-search-level"
                    options={[
                        ...(range(1,6).map((i) => {return { value: i.toString(), label: i.toString() }})),
                        {value: '6', label: '6 (Post A-Level)'}]}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Any"
                    onChange={selectOnChange(setSearchLevels)}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{menuPortal: base => ({...base, zIndex: 9999})}}
                />
            </div>}
        </div>
        <div className="row">
            {SITE_SUBJECT === SITE.PHY && isStaff(user) && <div className="text-wrap col">
                <RS.Form>
                    <RS.Label check><input type="checkbox" checked={searchFastTrack} onChange={e => setSearchFastTrack(e.target.checked)} />{' '}Show FastTrack questions</RS.Label>
                </RS.Form>
            </div>}
        </div>
        <div className="row">
            <div className="text-wrap col-lg-12 mt-2">
                <RS.Label htmlFor="question-search-title">Search</RS.Label>
                <RS.Input id="question-search-title"
                    type="text"
                    placeholder={{[SITE.CS]: "e.g. Creating an AST", [SITE.PHY]: "e.g. Man vs. Horse"}[SITE_SUBJECT]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </div>
        </div>
        <div className="d-sm-flex align-items-baseline mt-4">
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
                    value={{[SITE.PHY]: "Return to Board", [SITE.CS]: "Return to board"}[SITE_SUBJECT]}
                    disabled={selectedQuestions.size === 0}
                    className={"btn btn-block btn-secondary border-0"}
                    onClick={() => {
                        setOriginalSelectedQuestions(selectedQuestions);
                        setOriginalQuestionOrder(questionOrder);
                        dispatch(closeActiveModal());
                    }}
                />
            </div>
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
                        let qExamboardsMatch = (searchExamBoards.length == 0 || (question.tags && question.tags.filter((tag) => searchExamBoards.includes(tag)).length > 0));
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
    </div>;
};
