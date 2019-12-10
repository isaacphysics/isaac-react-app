import React, {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from "react";
import {closeActiveModal, searchQuestions} from "../../../state/actions";
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
    sortQuestions
} from "../../../services/gameboardBuilder";
import {allTagIds, getSubcategoryTags} from "../../../services/tags";
import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {EXAM_BOARD, examBoardTagMap, IS_CS_PLATFORM} from "../../../services/constants";
import {GameboardBuilderRow} from "../GameboardBuilderRow";

interface QuestionSearchModalProps {
    originalSelectedQuestions: Map<string, ContentSummaryDTO>;
    setOriginalSelectedQuestions: (m: Map<string, ContentSummaryDTO>) => void;
    originalQuestionOrder: string[];
    setOriginalQuestionOrder: (a: string[]) => void;
    eventLog: any[];
}

export const QuestionSearchModal = ({originalSelectedQuestions, setOriginalSelectedQuestions, originalQuestionOrder, setOriginalQuestionOrder, eventLog}: QuestionSearchModalProps) => {
    const dispatch = useDispatch();
    const [searchTopics, setSearchTopics] = useState<string[]>([]);

    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchLevels, setSearchLevels] = useState<string[]>([]);
    const [searchExamBoards, setSearchExamBoards] = useState<string[]>([]);

    const [questionsSort, setQuestionsSort] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState(new Map(originalSelectedQuestions));
    const [questionOrder, setQuestionOrder] = useState([...originalQuestionOrder]);

    const questions = useSelector((state: AppState) => state && state.gameboardEditorQuestions);
    const userPreferences = useSelector((state: AppState) => state && state.userPreferences);

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], levels: string[], examBoard: string[], fasttrack: boolean, startIndex: number) => {
            dispatch(searchQuestions({
                searchString: [searchString, ...([topics, levels, examBoard].map((tags) => tags.join(" ")))].filter((query) => query != "").join(" "),
                tags: "", fasttrack, startIndex, limit: 50
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, levels, examBoard, fasttrack, startIndex});
        }, 250),
        []
    );

    const sortableTableHeaderUpdateState = (sortState: { [s: string]: string }, setSortState: React.Dispatch<React.SetStateAction<{}>>, key: string) => (order: string) => {
        const newSortState = {...sortState};
        newSortState[key] = order;
        setSortState(newSortState);
    };

    useMemo(() => {
        if (userPreferences && userPreferences.EXAM_BOARD) {
            let examBoard;
            if (userPreferences.EXAM_BOARD[EXAM_BOARD.AQA]) {
                examBoard = EXAM_BOARD.AQA;
            } else if (userPreferences.EXAM_BOARD[EXAM_BOARD.OCR]) {
                examBoard = EXAM_BOARD.OCR;
            }

            if (examBoard) {
                setSearchExamBoards([examBoardTagMap[examBoard]]);
            }
        }
    }, [userPreferences]);

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTopics, searchLevels, searchExamBoards, false, 0);
    },[searchQuestionName, searchTopics, searchLevels, searchExamBoards]);

    return <div>
        <div className="row">
            <div className="text-wrap col-lg-6 mt-2">
                <RS.Label htmlFor="question-search-topic">Topic</RS.Label>
                <Select inputId="question-search-topic"
                    isMulti
                    options={getSubcategoryTags(allTagIds).map(groupTagSelectionsByParent)}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Any"
                    onChange={multiSelectOnChange(setSearchTopics)}
                />
            </div>
            <div className={"text-wrap my-2 " + (IS_CS_PLATFORM ? "col-lg-6" : "col-lg-3")}>
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
                />
            </div>
            {!IS_CS_PLATFORM && <div className="text-wrap col-lg-3 my-2">
                <RS.Label htmlFor="question-search-level">Level</RS.Label>
                <Select inputId="question-search-level"
                    isMulti
                    options={[
                        ...(range(1,6).map((i) => {return { value: i.toString(), label: i.toString() }})),
                        { value: '6', label: '6 (Post A-Level)' }]}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Any"
                    onChange={multiSelectOnChange(setSearchLevels)}
                />
            </div>}
        </div>
        <div className="row">
            <div className="text-wrap col-lg-12 mt-2">
                <RS.Label htmlFor="question-search-title">Search</RS.Label>
                <RS.Input id="question-search-title"
                    type="text"
                    placeholder="e.g. Creating an AST"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </div>
        </div>
        <div className={"mt-4"}>
            <RS.Input
                type="button" value={`Add ${selectedQuestions.size} question${selectedQuestions.size !== 1 ? "s" : ""}`}
                disabled={selectedQuestions.size === 0}
                className={"btn btn-block btn-secondary border-0"}
                onClick={() => {
                    setOriginalSelectedQuestions(selectedQuestions);
                    setOriginalQuestionOrder(questionOrder);
                    dispatch(closeActiveModal());
                }}
            />
        </div>
        <div className="responsive mt-4">
            <RS.Table bordered>
                <thead>
                    <tr>
                        <th className="w-5"> </th>
                        <SortableTableHeader
                            className="w-40" title="Question title"
                            updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title")}
                        />
                        <th className="w-25">Topic</th>
                        {!IS_CS_PLATFORM && <SortableTableHeader
                            className="w-15" title="Level"
                            updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "level")}
                        />}
                        <th className="w-15">Exam boards</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        questions && sortQuestions(questionsSort)(questions.filter((question) => {
                            return (searchLevels.length == 0 || (question.level && searchLevels.includes(question.level.toString()))) &&
                                (searchExamBoards.length == 0 || (question.tags && question.tags.filter((tag) => searchExamBoards.includes(tag)).length > 0)) &&
                                (searchTopics.length == 0 || (question.tags && question.tags.filter((tag) => searchTopics.includes(tag)).length > 0))
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
        </div>
    </div>
};
