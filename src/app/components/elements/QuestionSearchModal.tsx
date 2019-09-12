import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {closeActiveModal, searchQuestions} from "../../state/actions";
import * as RS from "reactstrap";
import {SortableTableHeader} from "./SortableTableHeader";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {debounce} from "lodash";
import {GameboardItem} from "../../../IsaacApiTypes";
import classnames from "classnames";
import Select from "react-select";
import {ValueType} from "react-select/src/types";
import {sortQuestions} from "../../services/gameboardBuilder";

interface QuestionSearchModalProps {
    originalSelectedQuestions: Map<string, GameboardItem>;
    setOriginalSelectedQuestions: (m: Map<string, GameboardItem>) => void;
    originalQuestionOrder: string[];
    setOriginalQuestionOrder: (a: string[]) => void;
}

export const QuestionSearchModal = ({originalSelectedQuestions, setOriginalSelectedQuestions, originalQuestionOrder, setOriginalQuestionOrder}: QuestionSearchModalProps) => {
    const dispatch = useDispatch();
    const [searchSubject, setSearchSubject] = useState([] as string[]);
    const [searchField, setSearchField] = useState([] as string[]);
    const [searchTopic, setSearchTopic] = useState([] as string[]);

    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchTags, setSearchTags] = useState([] as string[]);
    const [searchLevel, setSearchLevel] = useState([] as string[]);
    const [searchExamBoard, setSearchExamBoard] = useState("ANY");

    const [questionsSort, setQuestionsSort] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState(originalSelectedQuestions);
    const [questionOrder, setQuestionOrder] = useState(originalQuestionOrder);

    const questionsSelector = useSelector((state: AppState) => state && state.gameboardEditorQuestions);

    const searchDebounce = debounce((searchString: string, tags: string[], levels: string[], fasttrack: boolean, startIndex: number) =>
        dispatch(searchQuestions({
            searchString: (searchString + " " + [searchSubject, searchField, searchTopic].map((tags) => tags.join(" ")).join(" ")).trimRight(),
            tags: tags.join(","),
            levels: levels == [] ? "1,2,3,4,5,6" : levels.join(","),
            fasttrack,
            startIndex,
            limit: 100})), 250);

    const sortableTableHeaderUpdateState = (sortState: { [s: string]: string }, setSortState: React.Dispatch<React.SetStateAction<{}>>, key: string) => {
        return (order: string) => {
            const newSortState = {...sortState};
            newSortState[key] = order;
            setSortState(newSortState);
        };
    };

    const multiSelectOnChange = (setValue: Dispatch<SetStateAction<string[]>>) => (e: ValueType<{value: string; label: string;}>) => {
        if (e && (e as ReadonlyArray<{value: string; label: string;}>).map) {
            const arr = e as ReadonlyArray<{value: string; label: string;}>;
            setValue(arr.map((item) => item.value));
        }
    };

    const tagIcons = (tag: string) => {
        return <span key={tag} className="badge badge-pill badge-warning mx-1">{tag.replace(/[\s,_]+/, " ")}</span>
    };

    useEffect(() => {
        searchDebounce(searchQuestionName, searchTags, searchLevel, false, 0);
    },[searchQuestionName, searchTags, searchLevel, searchSubject, searchField, searchTopic]);

    return <div>
        <div className="row">
            <div className="text-wrap col-lg-6 mt-2">
                <RS.Label>Subject</RS.Label>
                <Select
                    isMulti
                    options={[{ value: 'physics', label: 'physics' },
                    { value: 'strawberry', label: 'Strawberry' },
                    { value: 'vanilla', label: 'Vanilla' }]}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchSubject)}
                />
            </div>
            <div className="text-wrap col-lg-6 my-2">
                <RS.Label>Field</RS.Label>
                <Select
                    isMulti
                    options={[{ value: 'chocolate', label: 'Chocolate' },
                        { value: 'strawberry', label: 'Strawberry' },
                        { value: 'vanilla', label: 'Vanilla' }]}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchField)}
                />
            </div>
        </div>
        <div className="row">
            <div className="text-wrap col-lg-6 mt-2">
                <RS.Label>Topic</RS.Label>
                <Select
                    isMulti
                    options={[{ value: 'chocolate', label: 'Chocolate' },
                        { value: 'strawberry', label: 'Strawberry' },
                        { value: 'vanilla', label: 'Vanilla' }]}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchTopic)}
                />
            </div>
            <div className="text-wrap col-lg-6 my-2">
                <RS.Label>Exam board</RS.Label>
                <RS.Input type="select" defaultValue={searchExamBoard}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setSearchExamBoard(e.target.value);
                          }}>
                    <option value="ANY">Any</option>
                    <option value="AQA">AQA</option>
                    <option value="EDEXCEL">Edexcel</option>
                </RS.Input>
            </div>
        </div>
        <div className="row">
            <div className="text-wrap col-lg-6 mt-2">
                <RS.Label>Title</RS.Label>
                <RS.Input
                    type="text"
                    placeholder="Year 12 Geology"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuestionName(e.target.value);
                    }}
                />
            </div>
            <div className="text-wrap col-lg-6 my-2">
                <RS.Label>Level</RS.Label>
                <Select
                    isMulti
                    options={[
                        ...([...Array(6)].map((_, i) => {return { value: i.toString(), label: i.toString() }})),
                        { value: '6', label: '6 (Post A-Level)' }]}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchLevel)}
                />
            </div>
        </div>
        <RS.Row className={"mt-4"}>
            <RS.Input type="button" value="Update questions"
                      className={"btn btn-block btn-secondary border-0"}
                      onClick={() => {
                          setOriginalSelectedQuestions(selectedQuestions);
                          setOriginalQuestionOrder(questionOrder);
                          dispatch(closeActiveModal());
                      }}
            />
        </RS.Row>
        <div className="responsive">
            <RS.Table bordered className="mt-4">
                <thead>
                <tr>
                    <SortableTableHeader className="col-md-4" title="Title"
                                         updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title")}/>
                    <th className={"col-md-3"}>Tags</th>
                    <SortableTableHeader className="col-md-1" title="Level"
                                         updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "level")}/>
                    <th className="col-md-2">Exam board</th>
                    <th className={"col-md-2"}>Selected</th>
                </tr>
                </thead>
                <tbody>
                {
                    questionsSelector && sortQuestions(questionsSort)(questionsSelector).map((question) =>
                        question.id && <tr key={question.id}>
                            <td>
                                <a href={question.url} target="_blank">{question.title}</a>
                            </td>
                            <td >
                                {question.tags && question.tags.map((tag) => tagIcons(tag))}
                            </td>
                            <td >
                                {question.level}
                            </td>
                            <td >
                                Not yet implemented
                            </td>
                            <td >
                                <RS.Button className={"btn-sm " + classnames({selected: selectedQuestions.has(question.id)})}
                                           onClick={() => {
                                               if (question.id) {
                                                   const newSelectedQuestions = new Map(selectedQuestions);
                                                   const newQuestionOrder = [...questionOrder];
                                                   if (newSelectedQuestions.has(question.id)) {
                                                       newSelectedQuestions.delete(question.id);
                                                       newQuestionOrder.splice(newQuestionOrder.indexOf(question.id), 1);
                                                   } else {
                                                       newSelectedQuestions.set(question.id, question);
                                                       newQuestionOrder.push(question.id);
                                                   }
                                                   setSelectedQuestions(newSelectedQuestions);
                                                   setQuestionOrder(newQuestionOrder);
                                               }
                                           }}
                                >{selectedQuestions.has(question.id) ? "Remove" : "Add"}</RS.Button>
                            </td>
                        </tr>
                    )
                }
                </tbody>
            </RS.Table>
        </div>
    </div>
};