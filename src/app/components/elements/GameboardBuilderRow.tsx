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
    TAG_LEVEL,
    GAMEBOARD_UNDO_STACK_SIZE_LIMIT
} from "../../services";
import React from "react";
import {AudienceContext} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal, useAppDispatch} from "../../state";
import {DraggableProvided, DraggableStateSnapshot} from "react-beautiful-dnd";
import {Question} from "../pages/Question";
import {ContentSummary} from "../../../IsaacAppTypes";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classNames from "classnames";

interface GameboardBuilderRowInterface {
    provided?: DraggableProvided;
    snapshot?: DraggableStateSnapshot;
    question: ContentSummary;
    selectedQuestions: Map<string, ContentSummary>;
    setSelectedQuestions: (m: Map<string, ContentSummary>) => void;
    setPreviousSelectedQuestionsStack: React.Dispatch<React.SetStateAction<Map<string, ContentSummary>[]>>;
    questionOrder: string[];
    setQuestionOrder: (a: string[]) => void;
    previousQuestionOrderStack: string[][];
    setPreviousQuestionOrderStack: React.Dispatch<React.SetStateAction<string[][]>>;
    resetRedoStacks: () => void;
    creationContext?: AudienceContext;
}

const GameboardBuilderRow = (
    {provided, snapshot, question, selectedQuestions, setSelectedQuestions, questionOrder, setQuestionOrder, previousQuestionOrderStack,
        setPreviousQuestionOrderStack, setPreviousSelectedQuestionsStack, resetRedoStacks, creationContext}: GameboardBuilderRowInterface
) => {
    const dispatch = useAppDispatch();

    const topicTag = () => {
        const tag = question.tags && tags.getSpecifiedTag(TAG_LEVEL.topic, question.tags as TAG_ID[]);
        return tag && tag.title;
    };
    const tagIcon = (tag: string) => {
        return <span key={tag} className={classNames("badge badge-pill mx-1", siteSpecific("badge-warning", "badge-primary"))}>{tag}</span>
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

    const cellClasses = "text-left align-middle";
    const isSelected = question.id !== undefined && selectedQuestions.has(question.id);

    return <tr
        key={question.id} ref={provided && provided.innerRef}
        className={classnames({selected: isSelected})}
        {...(provided && provided.draggableProps)} {...(provided && provided.dragHandleProps)}
    >
        <td className="w-5 text-center align-middle">
            <RS.CustomInput
                type="checkbox"
                id={`${provided ? "gameboard-builder" : "question-search-modal"}-include-${question.id}`}
                aria-label={!isSelected ? "Select question" : "Deselect question"}
                title={!isSelected ? "Select question" : "Deselect question"}
                color="secondary"
                className={!provided ? "isaac-checkbox mr-n2 ml-1" : undefined}
                checked={isSelected}
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
                        if (provided) {
                            if (previousQuestionOrderStack.length >= GAMEBOARD_UNDO_STACK_SIZE_LIMIT) {
                                setPreviousQuestionOrderStack(p => p.slice(1));
                                setPreviousSelectedQuestionsStack(p => p.slice(1));
                            }
                            setPreviousQuestionOrderStack(p => [...p, questionOrder]);
                            setPreviousSelectedQuestionsStack(p => [...p, selectedQuestions]);
                            resetRedoStacks();
                        }
                    }
                }}
            />
        </td>
        <td className={classNames(cellClasses, siteSpecific("w-40", "w-30"))}>
            {provided && <img src="/assets/drag_indicator.svg" alt="Drag to reorder" className="mr-1 grab-cursor" />}
            <a className="mr-2 text-wrap" href={`/questions/${question.id}`} target="_blank" rel="noopener noreferrer" title="Preview question in new tab">
                {generateQuestionTitle(question)}
            </a>
            <input
                type="image" src="/assets/new-tab.svg" alt="Preview question" title="Preview question in modal"
                className="pointer-cursor align-middle new-tab" onClick={() => {question.id && openQuestionModal(question.id)}}
            />
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
                {question.audience?.map((audienceRecord) => audienceRecord.examBoard?.map((examBoard) => tagIcon(examBoardLabelMap[examBoard])))}
                {/* When this becomes more common we should solve separation via a new row and merge other columns */}
                {i + 1 < collection.length && <hr className="text-center" />}
            </>)}
        </td>}
    </tr>;
};
export default GameboardBuilderRow;