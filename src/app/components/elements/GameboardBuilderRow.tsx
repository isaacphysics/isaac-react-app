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
import {DraggableProvided, DraggableStateSnapshot} from "@hello-pangea/dnd";
import {Question} from "../pages/Question";
import {ContentSummary, GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps} from "../../../IsaacAppTypes";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classNames from "classnames";
import { Spacer } from "./Spacer";
import { LLMFreeTextQuestionIndicator } from "./LLMFreeTextQuestionIndicator";
import { StyledCheckbox } from "./inputs/StyledCheckbox";
import { Markup } from "./markup";
import { QuestionPropertyTags } from "./ContentPropertyTags";
import { IconButton } from "./AffixButton";
import { CrossTopicQuestionIndicator } from "./CrossTopicQuestionIndicator";

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
    const filteredAudienceViews = audienceViews.length === 0 ? [{stage: undefined, difficulty: undefined}] : filterAudienceViewsByProperties(audienceViews, AUDIENCE_DISPLAY_FIELDS);

    const cellClasses = "text-start align-middle";
    const isSelected = question.id !== undefined && currentQuestions.selectedQuestions.has(question.id);

    const handleCheckboxChange = () => {
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
    };

    return filteredAudienceViews.map((view, i, arr) => <tr key={`${question.id} ${i}`}>
        {i === 0 && <>
            <td rowSpan={arr.length} className="w-5 text-center align-middle">
                <div className="d-flex justify-content-center">
                    {isAda && provided
                        ? <IconButton icon="icon-bin action-button-small" color="keyline" className="action-button" aria-label="Delete quiz" title="Delete quiz" onClick={handleCheckboxChange}/>
                        : <StyledCheckbox
                            id={`${provided ? "gameboard-builder" : "question-search-modal"}-include-${question.id}`}
                            aria-label={!isSelected ? "Select question" : "Deselect question"}
                            title={!isSelected ? "Select question" : "Deselect question"}
                            color="primary"
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                        />}
                </div>
            </td>
            <td rowSpan={arr.length} className={classNames(cellClasses, siteSpecific("w-40", "w-30"))}>
                <div className="d-flex">
                    {provided && <img src="/assets/common/icons/drag_indicator.svg" alt="Drag to reorder" className="me-1 grab-cursor" />}
                    <div>
                        <div className="d-flex">
                            <a className="me-2 text-wrap" href={`/questions/${question.id}`} target="_blank" rel="noopener noreferrer" title="Preview question in new tab">
                                <Markup encoding="latex">{generateQuestionTitle(question)}</Markup>
                            </a>
                            <button
                                type="button" title="Preview question in modal" className="pointer-cursor align-middle new-tab p-0" 
                                onClick={() => question.id && openQuestionModal(question.id)}
                            >
                                <img src="/assets/common/icons/new-tab.svg" alt="Preview question" />
                            </button>
                            <Spacer />
                        </div>
                        <QuestionPropertyTags className="my-1" deprecated={question.deprecated} supersededBy={question.supersededBy} tags={question.tags} />
                        {question.subtitle && <>
                            <span className="small text-muted d-none d-sm-block">{question.subtitle}</span>
                        </>}
                        {isAda && question.tags?.includes("cross_topic") && <div className="ms-n1 my-2 mb-lg-0">
                            <CrossTopicQuestionIndicator small />
                        </div>}
                        {question.tags?.includes("llm_question_page") && <div className="ms-n1 my-2 mb-lg-0">
                            <LLMFreeTextQuestionIndicator small />
                        </div>}
                    </div>
                </div>
            </td>
            <td rowSpan={arr.length} className={classNames(cellClasses, siteSpecific("w-25", "w-20"))}>
                {tags.getSpecifiedTag(TAG_LEVEL.topic, question.tags as TAG_ID[])?.title}
            </td>
        </>}
        <td className={classNames(cellClasses, "w-15")}>
            {view.stage && <span>{stageLabelMap[view.stage]}</span>}
        </td>
        {(isPhy || (isAda && i === 0)) && <td rowSpan={siteSpecific(1, arr.length)} className={classNames(cellClasses, "w-15")}> 
            {/* Show each difficulty icon for Physics or just the first one for Ada */}
            {view.difficulty && <DifficultyIcons difficulty={view.difficulty} />}
        </td>}
        {isAda && <td className={classNames(cellClasses, "w-15")}>
            {audienceViews.filter(audienceView => view.stage === audienceView.stage)
                .map(audienceView => audienceView.examBoard && tagIcon(examBoardLabelMap[audienceView.examBoard]))}
        </td>}
    </tr>);
};

export default GameboardBuilderRow;
