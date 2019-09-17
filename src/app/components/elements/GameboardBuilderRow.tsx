import classnames from "classnames";
import * as RS from "reactstrap";
import {examBoardTagMap, TAG_ID, TAG_LEVEL, tagExamboardMap} from "../../services/constants";
import React, {ChangeEvent} from "react";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal} from "../../state/actions";
import {store} from "../../state/store";
import {QuestionModal} from "./modals/QuestionModal";
import {useDispatch} from "react-redux";
import {DraggableProvided} from "react-beautiful-dnd";
import {allCategoryTags, allTagIds, getCategoryTags, getSpecifiedTag} from "../../services/tags";
import Select from "react-select";
import {convertTagToSelectionOption, groupTagSelectionsByParent} from "../../services/gameboardBuilder";

interface GameboardBuilderRowInterface {
    provided?: DraggableProvided;
    question: ContentSummaryDTO;
    selectedQuestions: Map<string, ContentSummaryDTO>;
    setSelectedQuestions: (m: Map<string, ContentSummaryDTO>) => void;
    questionOrder: string[];
    setQuestionOrder: (a: string[]) => void;
}

export const GameboardBuilderRow = ({provided, question, selectedQuestions, setSelectedQuestions, questionOrder, setQuestionOrder}: GameboardBuilderRowInterface) => {
    const dispatch = useDispatch();

    const topicTag = () => {
        const tag = question.tags && getSpecifiedTag(TAG_LEVEL.topic, question.tags as TAG_ID[]);
        return tag && tag.title;
    };
    const tagIcon = (tag: string) => {
        return <span key={tag} className="badge badge-pill badge-warning mx-1">{tag}</span>
    };

    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {store.dispatch(closeActiveModal())},
            size: "xl",
            title: "Question preview",
            body: <QuestionModal urlQuestionId={urlQuestionId}/>
        }))};

    return <tr key={question.id}
               ref={provided && provided.innerRef}
               className={classnames({selected: question.id && selectedQuestions.has(question.id)})}
               {...(provided && provided.draggableProps)}
               {...(provided && provided.dragHandleProps)}>
        <td>
            <div className="d-flex flex-row">
                {provided && <img src="/assets/drag_indicator.svg"
                                  className="mr-1"
                                  alt="Drag to reorder"/>}
                <RS.CustomInput
                    type="checkbox"
                    id={`question-search-modal-include-${question.id}`}
                    color="secondary"
                    checked={question.id !== undefined && selectedQuestions.has(question.id)}
                    onChange={(e: ChangeEvent<HTMLElement>) => {
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
            </div>
        </td>
        <td>
            <a className="mr-2" href={question.url} target="_blank">{question.title}</a>
            <img src="/assets/tab.svg"
                 alt="Preview question"
                 onClick={() => {question.id && openQuestionModal(question.id)}}/>
        </td>
        <td>
            {topicTag()}
        </td>
        <td>
            {question.level}
        </td>
        <td>
            {question.tags && question.tags.filter((tag) => Object.values(examBoardTagMap).includes(tag)).map((tag) => tagIcon(tagExamboardMap[tag]))}
        </td>
    </tr>
};
