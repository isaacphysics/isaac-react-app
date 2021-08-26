import classnames from "classnames";
import * as RS from "reactstrap";
import {
    difficultyLabelMap,
    examBoardTagMap,
    STAGE,
    stageLabelMap,
    TAG_ID,
    TAG_LEVEL,
    tagExamBoardMap
} from "../../services/constants";
import React from "react";
import {AudienceContext} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal} from "../../state/actions";
import {useDispatch} from "react-redux";
import {DraggableProvided} from "react-beautiful-dnd";
import tags from "../../services/tags";
import {Question} from "../pages/Question";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {ContentSummary} from "../../../IsaacAppTypes";
import {determineAudienceViews} from "../../services/userContext";

interface GameboardBuilderRowInterface {
    provided?: DraggableProvided;
    question: ContentSummary;
    selectedQuestions: Map<string, ContentSummary>;
    setSelectedQuestions: (m: Map<string, ContentSummary>) => void;
    questionOrder: string[];
    setQuestionOrder: (a: string[]) => void;
    creationContext?: AudienceContext;
}

export const GameboardBuilderRow = (
    {provided, question, selectedQuestions, setSelectedQuestions, questionOrder, setQuestionOrder, creationContext}: GameboardBuilderRowInterface
) => {
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
            closeAction: () => {dispatch(closeActiveModal())}, size: "xl",
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
                            newSelectedQuestions.set(question.id, {...question, creationContext});
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
                type="image" src="/assets/new-tab.svg" alt="Preview question" title="Preview question in modal"
                className="pointer-cursor align-middle new-tab" onClick={() => {question.id && openQuestionModal(question.id)}}
            />
        </td>
        <td className="w-25">
            {topicTag()}
        </td>
        <td className="w-15">
            {determineAudienceViews(question.audience, question.creationContext || creationContext)
                .map(view => <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`}>
                    {view.stage && view.stage !== STAGE.NONE && <span className="gameboard-tags">
                        {stageLabelMap[view.stage]}
                    </span>}
                </div>)
            }
        </td>
        {SITE_SUBJECT === SITE.PHY && <td className="w-15">
            {determineAudienceViews(question.audience, question.creationContext || creationContext)
                .map(view => <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`}>
                    {view.difficulty && <span className="gameboard-tags">
                        {difficultyLabelMap[view.difficulty]}
                    </span>}
                </div>)
            }
        </td>}
        {SITE_SUBJECT === SITE.CS && <td className="w-15">
            {question.tags && question.tags.filter((tag) => Object.values(examBoardTagMap).includes(tag)).map((tag) => tagIcon(tagExamBoardMap[tag]))}
        </td>}
    </tr>
};
