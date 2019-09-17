import classnames from "classnames";
import * as RS from "reactstrap";
import {examBoardTagMap, tagExamboardMap} from "../../services/constants";
import React from "react";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal} from "../../state/actions";
import {store} from "../../state/store";
import {QuestionModal} from "./modals/QuestionModal";
import {useDispatch} from "react-redux";
import {DraggableProvided} from "react-beautiful-dnd";

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

    const tagIcons = (tag: string) => {
        return <span key={tag} className="badge badge-pill badge-warning mx-1">{tag}</span>
    };

    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {store.dispatch(closeActiveModal())},
            title: "Question preview",
            body: <QuestionModal urlQuestionId={urlQuestionId}/>
        }))};

    return <tr key={question.id}
               ref={provided && provided.innerRef}
               className={classnames({selected: question.id && selectedQuestions.has(question.id)})}
               {...(provided && provided.draggableProps)}
               {...(provided && provided.dragHandleProps)}>
        <td>
            <RS.CustomInput
                type="checkbox"
                id={`question-search-modal-include-${question.id}`}
                color="secondary"
                checked={question.id !== undefined && selectedQuestions.has(question.id)}
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
            <RS.Input
                type="button"
                className="btn-link"
                value={question.title}
                onClick={() => {question.id && openQuestionModal(question.id)}}>
            </RS.Input>
        </td>
        <td>
            {question.tags && question.tags.map((tag) => tagIcons(tag))}
        </td>
        <td>
            {question.level}
        </td>
        <td>
            {question.tags && question.tags.filter((tag) => Object.values(examBoardTagMap).includes(tag)).map((tag) => tagExamboardMap[tag]).join(", ")}
        </td>
    </tr>
};
