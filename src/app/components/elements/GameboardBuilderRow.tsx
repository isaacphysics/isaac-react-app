import classnames from "classnames";
import * as RS from "reactstrap";
import {examBoardTagMap, IS_CS_PLATFORM, TAG_ID, TAG_LEVEL, tagExamBoardMap} from "../../services/constants";
import React from "react";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal} from "../../state/actions";
import {store} from "../../state/store";
import {useDispatch} from "react-redux";
import {DraggableProvided} from "react-beautiful-dnd";
import tags from "../../services/tags";
import {Question} from "../pages/Question";

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
        const tag = question.tags && tags.getSpecifiedTag(TAG_LEVEL.topic, question.tags as TAG_ID[]);
        return tag && tag.title;
    };
    const tagIcon = (tag: string) => {
        return <span key={tag} className="badge badge-pill badge-warning mx-1">{tag}</span>
    };

    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {store.dispatch(closeActiveModal())}, size: "xl",
            title: "Question preview", body: <Question questionIdOverride={urlQuestionId} />
        }))
    };

    return <tr
        key={question.id} ref={provided && provided.innerRef}
        className={classnames({selected: question.id && selectedQuestions.has(question.id)})}
        {...(provided && provided.draggableProps)} {...(provided && provided.dragHandleProps)}
    >
        <td className="text-center align-middle w-5">
            <RS.CustomInput
                type="checkbox"
                id={`${provided ? "gameboard-builder" : "question-search-modal"}-include-${question.id}`}
                aria-label="Select question"
                color="secondary"
                checked={question.id !== undefined && selectedQuestions.has(question.id)}
                onChange={() => {
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
        <td className="w-40">
            {provided && <img src="/assets/drag_indicator.svg" alt="Drag to reorder" className="mr-1 grab-cursor" />}
            <a className="mr-2" href={`/questions/${question.id}`} target="_blank" rel="noopener noreferrer" title="Preview question in new tab">
                {question.title}
            </a>
            <input
                type="image" src="/assets/library_books.svg" alt="Preview question" title="Preview question in modal"
                className="pointer-cursor align-middle" onClick={() => {question.id && openQuestionModal(question.id)}}
            />
        </td>
        <td className="w-25">
            {topicTag()}
        </td>
        {!IS_CS_PLATFORM && <td className="w-15">
            {question.level}
        </td>}
        {IS_CS_PLATFORM && <td className="w-15">
            {question.tags && question.tags.filter((tag) => Object.values(examBoardTagMap).includes(tag)).map((tag) => tagIcon(tagExamBoardMap[tag]))}
        </td>}
    </tr>
};
