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
    isPhy,
    GameboardBuilderRowInterface,
    handleBuilderRowChange
} from "../../services";
import React from "react";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classNames from "classnames";
import { Spacer } from "./Spacer";
import { LLMFreeTextQuestionIndicator } from "./LLMFreeTextQuestionIndicator";
import { StyledCheckbox } from "./inputs/StyledCheckbox";
import { Markup } from "./markup";
import { ContentPropertyTags } from "./ContentPropertyTags";
import { IconButton } from "./AffixButton";
import { CrossTopicQuestionIndicator } from "./CrossTopicQuestionIndicator";
import { PreviewQuestionButton } from "./PreviewButton";

const GameboardBuilderTableRow = (
    {isDnd, snapshot: _snapshot, question, undoStack, currentQuestions, redoStack, creationContext}: GameboardBuilderRowInterface
) => {
    const tagIcon = (tag: string) => {
        return <span key={tag} className={classNames("badge rounded-pill mx-1", siteSpecific("text-bg-warning", "text-bg-primary"))}>{tag}</span>;
    };

    const audienceViews = determineAudienceViews(question.audience, creationContext);
    const filteredAudienceViews = audienceViews.length === 0 ? [{stage: undefined, difficulty: undefined}] : filterAudienceViewsByProperties(audienceViews, AUDIENCE_DISPLAY_FIELDS);

    const cellClasses = "text-start align-middle";
    const isSelected = question.id !== undefined && currentQuestions.selectedQuestions.has(question.id);

    return filteredAudienceViews.map((view, i, arr) => <tr key={`${question.id} ${i}`}>
        {i === 0 && <>
            <td rowSpan={arr.length} className="w-5 text-center align-middle">
                <div className="d-flex justify-content-center">
                    {isAda && isDnd
                        ? <IconButton icon="icon-bin action-button-small" color="keyline" className="action-button" aria-label="Delete quiz" title="Delete quiz" onClick={() => handleBuilderRowChange({ isDnd, question, currentQuestions, undoStack, redoStack, creationContext })}/>
                        : <StyledCheckbox
                            id={`${isDnd ? "gameboard-builder" : "question-search-modal"}-include-${question.id}`}
                            aria-label={!isSelected ? "Select question" : "Deselect question"}
                            title={!isSelected ? "Select question" : "Deselect question"}
                            color="primary"
                            checked={isSelected}
                            onChange={() => handleBuilderRowChange({ isDnd, question, currentQuestions, undoStack, redoStack, creationContext })}
                        />}
                </div>
            </td>
            <td rowSpan={arr.length} className={classNames(cellClasses, siteSpecific("w-40", "w-30"))}>
                <div className="d-flex">
                    {isDnd && <i aria-label="Drag to reorder" className="ms-n1 me-1 grab-cursor icon icon-md icon-drag-indicator icon-color-black align-self-center" />}
                    <div>
                        <div className="d-flex">
                            <a className="text-wrap" href={`/questions/${question.id}`} target="_blank" rel="noopener noreferrer" title="Preview question in new tab">
                                <Markup encoding="latex">{generateQuestionTitle(question)}</Markup>
                            </a>
                            <PreviewQuestionButton id={question.id} className="ms-2" />
                            <Spacer />
                        </div>
                        <ContentPropertyTags className="my-1" deprecated={question.deprecated} supersededByPath={question.supersededBy ? `/questions/${question.supersededBy}` : undefined} tags={question.tags} />
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

export default GameboardBuilderTableRow;
