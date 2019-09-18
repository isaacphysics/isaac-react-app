import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from "react";
import {closeActiveModal, searchQuestions} from "../../state/actions";
import * as RS from "reactstrap";
import {SortableTableHeader} from "./SortableTableHeader";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {debounce, range} from "lodash";
import Select from "react-select";
import {ValueType} from "react-select/src/types";
import {convertExamBoardToOption, groupTagSelectionsByParent, sortQuestions} from "../../services/gameboardBuilder";
import {allTagIds, getSubcategoryTags} from "../../services/tags";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {EXAM_BOARD, examBoardTagMap} from "../../services/constants";
import {GameboardBuilderRow} from "./GameboardBuilderRow";

interface QuestionSearchModalProps {
    originalSelectedQuestions: Map<string, ContentSummaryDTO>;
    setOriginalSelectedQuestions: (m: Map<string, ContentSummaryDTO>) => void;
    originalQuestionOrder: string[];
    setOriginalQuestionOrder: (a: string[]) => void;
}

export const QuestionSearchModal = ({originalSelectedQuestions, setOriginalSelectedQuestions, originalQuestionOrder, setOriginalQuestionOrder}: QuestionSearchModalProps) => {
    const dispatch = useDispatch();
    const [searchTopics, setSearchTopics] = useState<string[]>([]);

    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchLevels, setSearchLevels] = useState<string[]>([]);
    const [searchExamBoards, setSearchExamBoards] = useState<string[]>([]);

    const [questionsSort, setQuestionsSort] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState(originalSelectedQuestions);
    const [questionOrder, setQuestionOrder] = useState(originalQuestionOrder);

    const questionsSelector = useSelector((state: AppState) => state && state.gameboardEditorQuestions);
    const userPreferencesSelector = useSelector((state: AppState) => state && state.userPreferences);

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], levels: string[], examBoard: string[], fasttrack: boolean, startIndex: number) =>
            dispatch(searchQuestions({
                searchString: [searchString, ...([topics, levels, examBoard].map((tags) => tags.join(" ")))].filter((query) => query != "").join(" "),
                tags: "",
                fasttrack,
                startIndex,
                limit: 50})),
            250),
        []);

    const sortableTableHeaderUpdateState = (sortState: { [s: string]: string }, setSortState: React.Dispatch<React.SetStateAction<{}>>, key: string) => (order: string) => {
        const newSortState = {...sortState};
        newSortState[key] = order;
        setSortState(newSortState);
    };

    const multiSelectOnChange = (setValue: Dispatch<SetStateAction<string[]>>) => (e: ValueType<{value: string; label: string;}>) => {
        if (e && (e as ReadonlyArray<{value: string; label: string;}>).map) {
            const arr = e as ReadonlyArray<{value: string; label: string;}>;
            setValue(arr.map((item) => item.value));
        } else {
            setValue([]);
        }
    };

    useEffect(() => {
        if (userPreferencesSelector && userPreferencesSelector.EXAM_BOARD) {
            let examBoard;
            if (userPreferencesSelector.EXAM_BOARD[EXAM_BOARD.AQA]) {
                examBoard = EXAM_BOARD.AQA;
            } else if (userPreferencesSelector.EXAM_BOARD[EXAM_BOARD.OCR]) {
                examBoard = EXAM_BOARD.OCR;
            }

            if (examBoard) {
                setSearchExamBoards([examBoardTagMap[examBoard]]);
            }
        }
    }, [userPreferencesSelector]);

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTopics, searchLevels, searchExamBoards, false, 0);
    },[searchQuestionName, searchTopics, searchLevels, searchExamBoards]);

    return <div>
        <div className="row">
            <div className="text-wrap col-lg-6 mt-2">
                <RS.Label htmlFor="topic">Topic</RS.Label>
                <Select
                    isMulti
                    options={getSubcategoryTags(allTagIds).map(groupTagSelectionsByParent)}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Any"
                    onChange={multiSelectOnChange(setSearchTopics)}
                />
            </div>
            <div className="text-wrap col-lg-3 my-2">
                <RS.Label htmlFor="exam-board">Exam board</RS.Label>
                <Select
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
            <div className="text-wrap col-lg-3 my-2">
                <RS.Label htmlFor="level">Level</RS.Label>
                <Select
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
            </div>
        </div>
        <div className="row">
            <div className="text-wrap col-lg-12 mt-2">
                <RS.Label htmlFor="title">Search</RS.Label>
                <RS.Input
                    type="text"
                    placeholder="e.g. Creating an AST"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </div>
        </div>
        <RS.Row className={"mt-4"}>
            <RS.Input type="button" value="Add questions"
                      className={"btn btn-block btn-secondary border-0"}
                      onClick={() => {
                          setOriginalSelectedQuestions(selectedQuestions);
                          setOriginalQuestionOrder(questionOrder);
                          dispatch(closeActiveModal());
                      }}
            />
        </RS.Row>
        <div className="responsive mt-4">
            <RS.Table bordered>
                <thead>
                <tr>
                    <th className={"col-md-1"}> </th>
                    <SortableTableHeader className="col-md-5" title="Question title"
                                         updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title")}/>
                    <th className={"col-md-3"}>Topic</th>
                    <SortableTableHeader className="col-md-1" title="Level"
                                         updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "level")}/>
                    <th className="col-md-2">Exam board</th>
                </tr>
                </thead>
                <tbody>
                {
                    questionsSelector && sortQuestions(questionsSort)(questionsSelector.filter((question) => {
                        return (searchLevels.length == 0 || (question.level && searchLevels.includes(question.level.toString()))) &&
                            (searchExamBoards.length == 0 || (question.tags && question.tags.filter((tag) => searchExamBoards.includes(tag)).length > 0))
                    })).map((question) =>
                        <GameboardBuilderRow key={question.id}
                                             question={question}
                                             selectedQuestions={selectedQuestions}
                                             setSelectedQuestions={setSelectedQuestions}
                                             questionOrder={questionOrder}
                                             setQuestionOrder={setQuestionOrder}/>
                    )
                }
                </tbody>
            </RS.Table>
        </div>
    </div>
};