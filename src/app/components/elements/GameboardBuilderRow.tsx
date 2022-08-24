import classnames from "classnames";
import * as RS from "reactstrap";
import {examBoardLabelMap, stageLabelMap, TAG_ID, TAG_LEVEL} from "../../services/constants";
import React from "react";
import {AudienceContext} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal} from "../../state/actions";
import {useAppDispatch} from "../../state/store";
import {DraggableProvided} from "react-beautiful-dnd";
import tags from "../../services/tags";
import {Question} from "../pages/Question";
import {isCS, siteSpecific} from "../../services/siteConstants";
import {ContentSummary} from "../../../IsaacAppTypes";
import {generateQuestionTitle} from "../../services/questions";
import {
    AUDIENCE_DISPLAY_FIELDS,
    determineAudienceViews,
    filterAudienceViewsByProperties, findAudienceRecordsMatchingPartial
} from "../../services/userContext";
import {DifficultyIcons} from "./svg/DifficultyIcons";

interface GameboardBuilderRowInterface {
    provided?: DraggableProvided;
    question: ContentSummary;
    selectedQuestions: Map<string, ContentSummary>;
    setSelectedQuestions: (m: Map<string, ContentSummary>) => void;
    questionOrder: string[];
    setQuestionOrder: (a: string[]) => void;
    creationContext?: AudienceContext;
}

const GameboardBuilderRow = (
    {provided, question, selectedQuestions, setSelectedQuestions, questionOrder, setQuestionOrder, creationContext}: GameboardBuilderRowInterface
) => {
    const dispatch = useAppDispatch();

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

    const filteredAudienceViews = filterAudienceViewsByProperties(
        determineAudienceViews(question.audience, creationContext),
        AUDIENCE_DISPLAY_FIELDS
    );

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
                {generateQuestionTitle(question)}
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
            {filteredAudienceViews.map(v => v.stage).map(stage => <div key={stage}>
                {stage && <span>{stageLabelMap[stage]}</span>}
            </div>)}
        </td>
        <td className={siteSpecific("w-15","w-10")}>
            {filteredAudienceViews.map(v => v.difficulty).map((difficulty, i) => <div key={`${difficulty} ${i}`}>
                {difficulty && <DifficultyIcons difficulty={difficulty} />}
            </div>)}
        </td>
        {isCS && <td className="w-5">
            {filteredAudienceViews.map((audienceView, i, collection) => <>
                {findAudienceRecordsMatchingPartial(question.audience, audienceView)
                    .map((audienceRecord) => audienceRecord.examBoard?.map((examBoard) => <div key={examBoard}>
                        {examBoard && <span>{tagIcon(examBoardLabelMap[examBoard])}</span>}
                    </div>))
                }
                {/* When this becomes more common we should solve separation via a new row and merge other columns */}
                {i + 1 < collection.length && <hr className="text-center" />}
            </>)}
        </td>}
    </tr>
};
export default GameboardBuilderRow;