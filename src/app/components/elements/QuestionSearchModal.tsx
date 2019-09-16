import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from "react";
import {closeActiveModal, searchQuestions} from "../../state/actions";
import * as RS from "reactstrap";
import {SortableTableHeader} from "./SortableTableHeader";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {debounce} from "lodash";
import Select from "react-select";
import {ValueType} from "react-select/src/types";
import {convertTagsToSelectionOptions, sortQuestions} from "../../services/gameboardBuilder";
import {allCategoryTags, allTagIds, getSubcategoryTags, getTopicTags} from "../../services/tags";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";

interface QuestionSearchModalProps {
    originalSelectedQuestions: Map<string, ContentSummaryDTO>;
    setOriginalSelectedQuestions: (m: Map<string, ContentSummaryDTO>) => void;
    originalQuestionOrder: string[];
    setOriginalQuestionOrder: (a: string[]) => void;
}

export const QuestionSearchModal = ({originalSelectedQuestions, setOriginalSelectedQuestions, originalQuestionOrder, setOriginalQuestionOrder}: QuestionSearchModalProps) => {
    const dispatch = useDispatch();
    const [searchSubjects, setSearchSubjects] = useState([] as string[]);
    const [searchFields, setSearchFields] = useState([] as string[]);
    const [searchTopics, setSearchTopics] = useState([] as string[]);

    const [searchQuestionName, setSearchQuestionName] = useState("");
    const [searchLevels, setSearchLevels] = useState([] as string[]);
    const [searchExamBoards, setSearchExamBoards] = useState([] as string[]);

    const [questionsSort, setQuestionsSort] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState(originalSelectedQuestions);
    const [questionOrder, setQuestionOrder] = useState(originalQuestionOrder);

    const questionsSelector = useSelector((state: AppState) => state && state.gameboardEditorQuestions);

    const searchDebounce = useCallback(
        debounce((searchString: string, subject: string[], field: string[], topic: string[], levels: string[], examboard: string[], fasttrack: boolean, startIndex: number) =>
            dispatch(searchQuestions({
                searchString: [searchString, ...([subject, field, topic, levels].map((tags) => tags.join(" ")))].filter((query) => query != "").join(" "),
                tags: examboard.join(","),
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

    const tagIcons = (tag: string) => {
        return <span key={tag} className="badge badge-pill badge-warning mx-1">{tag.replace(/[\s,_]+/, " ")}</span>
    };

    useEffect(() => {
        searchDebounce(searchQuestionName, searchSubjects, searchFields, searchTopics, searchLevels, searchExamBoards, false, 0);
    },[searchQuestionName, searchSubjects, searchFields, searchTopics, searchLevels, searchExamBoards]);

    return <div>
        <div className="row">
            <div className="text-wrap col-lg-6 mt-2">
                <RS.Label>Subject</RS.Label>
                <Select
                    isMulti
                    options={convertTagsToSelectionOptions(allCategoryTags)}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchSubjects)}
                />
            </div>
            <div className="text-wrap col-lg-6 my-2">
                <RS.Label>Field</RS.Label>
                <Select
                    isMulti
                    options={convertTagsToSelectionOptions(getSubcategoryTags(allTagIds))}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchFields)}
                />
            </div>
        </div>
        <div className="row">
            <div className="text-wrap col-lg-6 mt-2">
                <RS.Label>Topic</RS.Label>
                <Select
                    isMulti
                    options={convertTagsToSelectionOptions(getTopicTags(allTagIds))}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchTopics)}
                />
            </div>
            <div className="text-wrap col-lg-6 my-2">
                <RS.Label>Exam board</RS.Label>
                <Select
                    isMulti
                    options={[{ value: 'examboard_aqa', label: 'AQA' },
                        { value: 'examboard_ocr', label: 'OCR' }]}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={multiSelectOnChange(setSearchExamBoards)}
                />
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
                    onChange={multiSelectOnChange(setSearchLevels)}
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
                    <th className={"col-md-1"}> </th>
                    <SortableTableHeader className="col-md-5" title="Title"
                                         updateState={sortableTableHeaderUpdateState(questionsSort, setQuestionsSort, "title")}/>
                    <th className={"col-md-3"}>Tags</th>
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
                        question.id && <tr key={question.id}>
                            <td>
                                <RS.CustomInput
                                    type="checkbox"
                                    id={`question-search-modal-include-${question.id}`}
                                    color="secondary"
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
                                />
                            </td>
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
                        </tr>
                    )
                }
                </tbody>
            </RS.Table>
        </div>
    </div>
};