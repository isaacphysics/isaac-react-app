import classnames from "classnames";
import * as RS from "reactstrap";
import {
    tags,
    AUDIENCE_DISPLAY_FIELDS,
    determineAudienceViews,
    examBoardLabelMap,
    filterAudienceViewsByProperties,
    generateQuestionTitle,
    isAda,
    siteSpecific,
    stageLabelMap,
    TAG_ID,
    TAG_LEVEL
} from "../../services";
import React from "react";
import {AudienceContext} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal, useAppDispatch} from "../../state";
import {DraggableProvided, DraggableStateSnapshot} from "react-beautiful-dnd";
import {Question} from "../pages/Question";
import {ContentSummary, GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps} from "../../../IsaacAppTypes";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classNames from "classnames";

interface GameboardBuilderRowInterface {
    provided?: DraggableProvided;
    snapshot?: DraggableStateSnapshot;
    question: ContentSummary;
    currentQuestions: GameboardBuilderQuestions;
    undoStack: GameboardBuilderQuestionsStackProps;
    redoStack: GameboardBuilderQuestionsStackProps;
    creationContext?: AudienceContext;
}

const GameboardBuilderRow = (
    {provided, snapshot, question, undoStack, currentQuestions, redoStack, creationContext}: GameboardBuilderRowInterface
) => {
    const dispatch = useAppDispatch();

    const topicTag = () => {
        const tag = question.tags && tags.getSpecifiedTag(TAG_LEVEL.topic, question.tags as TAG_ID[]);
        return tag && tag.title;
    };
    const tagIcon = (tag: string) => {
        return <span key={tag} className={classNames("badge rounded-pill mx-1", siteSpecific("text-bg-warning", "text-bg-primary"))}>{tag}</span>
    };

    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal())}, size: "xl",
            title: "Question preview", body: <Question questionIdOverride={urlQuestionId} preview />
        }))
    };

    const filteredAudienceViews = filterAudienceViewsByProperties(
        determineAudienceViews(question.audience, creationContext),
        AUDIENCE_DISPLAY_FIELDS
    );

    const cellClasses = "text-start align-middle";
    const isSelected = question.id !== undefined && currentQuestions.selectedQuestions.has(question.id);

    return <tr
        key={question.id} ref={provided && provided.innerRef}
        className={classnames({selected: isSelected})}
        {...(provided && provided.draggableProps)} {...(provided && provided.dragHandleProps)}
    >
        <td className="w-5 text-center align-middle">
            <RS.Input
                type="checkbox"
                id={`${provided ? "gameboard-builder" : "question-search-modal"}-include-${question.id}`}
                aria-label={!isSelected ? "Select question" : "Deselect question"}
                title={!isSelected ? "Select question" : "Deselect question"}
                color="secondary"
                className={!provided ? "isaac-checkbox me-n2 ms-1" : undefined}
                checked={isSelected}
                onChange={() => {
                    if (question.id) {
                        const newSelectedQuestions = new Map(currentQuestions.selectedQuestions);
                        const newQuestionOrder = [...currentQuestions.questionOrder];
                        if (newSelectedQuestions.has(question.id)) {
                            newSelectedQuestions.delete(question.id);
                            newQuestionOrder.splice(newQuestionOrder.indexOf(question.id), 1);
                        } else {
                            newSelectedQuestions.set(question.id, {...question, creationContext});
                            newQuestionOrder.push(question.id);
                        }
                        currentQuestions.setSelectedQuestions(newSelectedQuestions);
                        currentQuestions.setQuestionOrder(newQuestionOrder);
                        if (provided) {
                            undoStack.push({questionOrder: currentQuestions.questionOrder, selectedQuestions: currentQuestions.selectedQuestions});
                            redoStack.clear();
                        }
                    }
                }}
            />
        </td>
        <td className={classNames(cellClasses, siteSpecific("w-40", "w-30"))}>
            {provided && <img src="/assets/common/icons/drag_indicator.svg" alt="Drag to reorder" className="me-1 grab-cursor" />}
            <a className="me-2 text-wrap" href={`/questions/${question.id}`} target="_blank" rel="noopener noreferrer" title="Preview question in new tab">
                {generateQuestionTitle(question)}
            </a>
            <input
                type="image" src="/assets/common/icons/new-tab.svg" alt="Preview question" title="Preview question in modal"
                className="pointer-cursor align-middle new-tab" onClick={() => {question.id && openQuestionModal(question.id)}}
            />
            {question.subtitle && <>
                <br/>
                <span className="small text-muted d-none d-sm-block">{question.subtitle}</span>
            </>}
        </td>
        <td className={classNames(cellClasses, siteSpecific("w-25", "w-20"))}>
            {topicTag()}
        </td>
        <td className={classNames(cellClasses, "w-15")}>
            {filteredAudienceViews.map(v => v.stage).map(stage => <div key={stage}>
                {stage && <span>{stageLabelMap[stage]}</span>}
            </div>)}
        </td>
        <td className={classNames(cellClasses, "w-15")}>
            {filteredAudienceViews.map(v => v.difficulty).map((difficulty, i) => <div key={`${difficulty} ${i}`}>
                {difficulty && <DifficultyIcons difficulty={difficulty} />}
            </div>)}
        </td>
        {isAda && <td className={classNames(cellClasses, "w-15")}>
            {filteredAudienceViews.map((audienceView, i, collection) => <>
                {/* was `findAudienceRecordsMatchingPartial(question.audience, audienceView).map(...)` but it seemed to be broken */}
                {Array.from(new Set(question.audience?.map((audienceRecord) => audienceRecord.examBoard).flat())).map((examBoard) => tagIcon(examBoardLabelMap[examBoard!]))}
                {/* When this becomes more common we should solve separation via a new row and merge other columns */}
                {i + 1 < collection.length && <hr className="text-center" />}
            </>)}
        </td>}
    </tr>;
};
export default GameboardBuilderRow;