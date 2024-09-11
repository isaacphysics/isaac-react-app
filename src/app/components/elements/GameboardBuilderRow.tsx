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
    isPhy
} from "../../services";
import React from "react";
import {AudienceContext} from "../../../IsaacApiTypes";
import {closeActiveModal, openActiveModal, useAppDispatch} from "../../state";
import {DraggableProvided, DraggableStateSnapshot} from "react-beautiful-dnd";
import {Question} from "../pages/Question";
import {ContentSummary, GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps} from "../../../IsaacAppTypes";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classNames from "classnames";
import { Spacer } from "./Spacer";

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
    {provided, snapshot: _snapshot, question, undoStack, currentQuestions, redoStack, creationContext}: GameboardBuilderRowInterface
) => {
    const dispatch = useAppDispatch();

    const topicTag = () => {
        const tag = question.tags && tags.getSpecifiedTag(TAG_LEVEL.topic, question.tags as TAG_ID[]);
        return tag && tag.title;
    };
    const tagIcon = (tag: string) => {
        return <span key={tag} className={classNames("badge rounded-pill mx-1", siteSpecific("text-bg-warning", "text-bg-primary"))}>{tag}</span>;
    };

    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());}, size: "xl",
            title: "Question preview", body: <Question questionIdOverride={urlQuestionId} preview />
        }));
    };

    const audienceViews = determineAudienceViews(question.audience, creationContext);
    const filteredAudienceViews = filterAudienceViewsByProperties(audienceViews, AUDIENCE_DISPLAY_FIELDS);

    const cellClasses = "text-start align-middle";
    const isSelected = question.id !== undefined && currentQuestions.selectedQuestions.has(question.id);

    return filteredAudienceViews.map((view, i, arr) => <tr
        key={`${question.id} ${i}`} className={classnames({selected: isSelected})}
    >
        {i === 0 && <>
            <td rowSpan={arr.length} className="w-5 text-center align-middle">
                <div className="d-flex justify-content-center">
                    <RS.Input
                        type="checkbox"
                        id={`${provided ? "gameboard-builder" : "question-search-modal"}-include-${question.id}`}
                        aria-label={!isSelected ? "Select question" : "Deselect question"}
                        title={!isSelected ? "Select question" : "Deselect question"}
                        color="secondary"
                        className={!provided ? "isaac-checkbox mt-1" : undefined}
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
                </div>
            </td>
            <td rowSpan={arr.length} className={classNames(cellClasses, siteSpecific("w-40", "w-30"))}>
                <div className="d-flex">
                    {provided && <img src="/assets/common/icons/drag_indicator.svg" alt="Drag to reorder" className="me-1 grab-cursor" />}
                    <div>
                        <div className="d-flex">
                            <a className="me-2 text-wrap" href={`/questions/${question.id}`} target="_blank" rel="noopener noreferrer" title="Preview question in new tab">
                                {generateQuestionTitle(question)}
                            </a>
                            <input
                                type="image" src="/assets/common/icons/new-tab.svg" alt="Preview question" title="Preview question in modal"
                                className="pointer-cursor align-middle new-tab" onClick={() => question.id && openQuestionModal(question.id)}
                            />
                            <Spacer />
                            {isPhy && <div className="d-flex flex-column justify-self-end">
                                {question.supersededBy && <a 
                                    className="superseded-tag ms-1 ms-sm-3 my-1 align-self-end" 
                                    href={`/questions/${question.supersededBy}`}
                                    onClick={(e) => e.stopPropagation()}
                                >SUPERSEDED</a>}
                                {question.tags?.includes("nofilter") && <span
                                    className="superseded-tag ms-1 ms-sm-3 my-1 align-self-end" 
                                >NO-FILTER</span>}
                            </div>}
                        </div>

                        {question.subtitle && <>
                            <span className="small text-muted d-none d-sm-block">{question.subtitle}</span>
                        </>}
                    </div>
                </div>
            </td>
            <td rowSpan={arr.length} className={classNames(cellClasses, siteSpecific("w-25", "w-20"))}>
                {topicTag()}
            </td>
        </>}
        <td className={classNames(cellClasses, "w-15")}>
            {view.stage && <span>{stageLabelMap[view.stage]}</span>}
        </td>
        {(isPhy || i === 0) && <td rowSpan={siteSpecific(1, arr.length)} className={classNames(cellClasses, "w-15")}>
            {/* Show each difficulty icon for Physics or just the first one for Ada */}
            <div>
                {view.difficulty && <DifficultyIcons difficulty={view.difficulty} />}
            </div>
        </td>}
        {isAda && <td className={classNames(cellClasses, "w-15")}>
            {audienceViews.filter(audienceView => view.stage === audienceView.stage)
                .map(audienceView => audienceView.examBoard && tagIcon(examBoardLabelMap[audienceView.examBoard]))}
        </td>}
    </tr>);
};

export default GameboardBuilderRow;
