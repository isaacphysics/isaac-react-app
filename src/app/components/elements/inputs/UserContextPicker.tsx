import React from "react";
import {Input, Label, UncontrolledTooltip} from "reactstrap";
import {CONTEXT_SOURCE, hasDefaultPreferences} from "../../../services/userViewingContext";
import {
    EXAM_BOARD,
    examBoardLabelMap,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    isAda,
    isDefined,
    isLoggedIn,
    isPhy,
    isStaff,
    SITE_TITLE_SHORT,
    siteSpecific,
    sortStages,
    STAGE,
    stageLabelMap,
    stagesOrdered,
    useUserViewingContext
} from "../../../services";
import {selectors, transientUserContextSlice, useAppDispatch, useAppSelector,} from "../../../state";
import classNames from "classnames";

const contextExplanationMap: {[key in CONTEXT_SOURCE]: string} = {
    [CONTEXT_SOURCE.TRANSIENT]: "these context picker settings",
    [CONTEXT_SOURCE.REGISTERED]: "your account settings",
    [CONTEXT_SOURCE.GAMEBOARD]: `the ${siteSpecific("question deck", "quiz")} settings`,
    [CONTEXT_SOURCE.DEFAULT]: `${SITE_TITLE_SHORT}'s default settings`,
    [CONTEXT_SOURCE.PAGE_CONTEXT]: "the page context, which always takes precedence over the context picker settings. Try reloading to remove the page context to switch",
    [CONTEXT_SOURCE.NOT_IMPLEMENTED]: "the site's settings"
};

const formatContextExplanation = (stageExplanation: CONTEXT_SOURCE, examBoardExplanation: CONTEXT_SOURCE, isMultiStage?: boolean) => {
    if (isAda) {
        if (stageExplanation == examBoardExplanation) {
            return `The stage and exam board were specified by ${contextExplanationMap[stageExplanation]}.`;
        } else {
            return `The stage was specified by ${contextExplanationMap[stageExplanation]} and the exam board by 
            ${contextExplanationMap[examBoardExplanation]}.`;
        }
    } else {
        return `${isMultiStage ? "These stages were" : "This stage was"} specified by ${contextExplanationMap[stageExplanation]}.`;
    }
};

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);

    const userViewingContext = useUserViewingContext();
    const {stage: currentStage, examBoard: currentExamBoard} = userViewingContext.contexts[0];
    const viewingContextStages = isPhy
        ? sortStages(userViewingContext.contexts.map(c => c.stage).filter(isDefined)) as STAGE[]
        : [(currentStage ?? STAGE.ALL) as STAGE];
    const currentStages = isPhy && stagesOrdered.every(stage =>
        stage === STAGE.FURTHER_A || stage === STAGE.ALL || viewingContextStages.includes(stage as STAGE)
    ) ? [STAGE.ALL] : viewingContextStages;

    const filteredExamBoardOptions = getFilteredExamBoardOptions({byUser: user, byStages: currentStages, includeNullOptions: true});
    const allStages = getFilteredStageOptions({includeNullOptions: true});

    const onlyOneBoard : {label: string, value: EXAM_BOARD} | undefined = filteredExamBoardOptions.length === 2 && filteredExamBoardOptions.map(eb => eb.value).includes(EXAM_BOARD.ALL)
        ? filteredExamBoardOptions.filter(eb => eb.value !== EXAM_BOARD.ALL)[0]
        : undefined;

    const stagesString = (stages: STAGE[]) => {
        return stages.map(s => stageLabelMap[s]).join(", ");
    };

    if (isAda && !isLoggedIn(user) || isStaff(user)) {
        return <div className={classNames(`d-flex flex-column px-0 context-picker-container no-print ${className}`, {"w-100 mt-2": isAda})}>
            <div className={classNames("d-flex m-0 p-0 justify-content-md-end", {"ms-md-2": isAda})}>
                {/* Stage Selector */}
                <div className={classNames("form-group w-100 d-flex justify-content-end align-items-center m-0", {"mb-3": isAda}, {"align-items-center": isPhy})}>
                    {!hideLabels && <Label className="d-inline-block pe-2" htmlFor="uc-stage-select">Stage</Label>}
                    {(userViewingContext.explanation.stage === CONTEXT_SOURCE.TRANSIENT || userViewingContext.explanation.examBoard === CONTEXT_SOURCE.TRANSIENT) &&
                        <button className="icon-reset mb-1" aria-label={"Reset viewing context"} onClick={() => {
                            dispatch(transientUserContextSlice.actions.setExamBoard(undefined));
                            dispatch(transientUserContextSlice.actions.setStage(undefined));
                        }}/>
                    }
                    <Input
                        className={classNames("flex-grow-1 d-inline-block ps-2 pe-0", {"me-1": isAda})}
                        type="select" id="uc-stage-select"
                        aria-label={hideLabels ? "Stage" : undefined}
                        value={currentStages.length === 1 ? currentStages[0] : stagesString(currentStages)}
                        disabled={userViewingContext.isFixedContext}
                        onChange={e => {
                            const newStage = e.target.value as STAGE;
                            if (isAda) {
                                // Derive exam board selection so that it is a valid option
                                const examBoards = getFilteredExamBoardOptions({byStages: [newStage], includeNullOptions: true});
                                let newExamBoard = currentExamBoard;
                                if (!examBoards.some(board => board.value === newExamBoard)) {
                                    const possibleExamBoards =
                                        getFilteredExamBoardOptions({byUser: user, byStages: [newStage], includeNullOptions: true}).map(eb => eb.value);
                                    // If we only have one possible exam board besides All, use that.
                                    if (possibleExamBoards.length === 2 && possibleExamBoards.includes(EXAM_BOARD.ALL)) {
                                        newExamBoard = possibleExamBoards.find(board => board !== EXAM_BOARD.ALL);
                                    } else {
                                        // Try to use default preferences (Stage All, Board Ada) otherwise default to All.
                                        const defaultExamBoard = newStage === STAGE.ALL ? EXAM_BOARD.ADA : EXAM_BOARD.ALL;
                                        newExamBoard = possibleExamBoards.includes(defaultExamBoard) ? defaultExamBoard : possibleExamBoards[0] ?? defaultExamBoard;
                                    }
                                }
                                dispatch(transientUserContextSlice.actions.setExamBoard(newExamBoard as EXAM_BOARD));
                            }
                            dispatch(transientUserContextSlice.actions.setStage(newStage));
                        }}
                    >
                        {allStages.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        {isPhy && currentStages.length > 1 &&
                            <option>{stagesString(currentStages)}</option>}
                    </Input>
                    {isAda &&
                        <>
                            {/* Exam Board Selector */}
                            {!hideLabels && <Label className="d-inline-block pe-2" htmlFor="uc-exam-board-select">Exam Board</Label>}
                            <Input
                                className={`flex-grow-1 d-inline-block ps-2 pe-0 ms-2`}
                                type="select" id="uc-exam-board-select"
                                aria-label={hideLabels ? "Exam Board" : undefined}
                                value={currentExamBoard}
                                onChange={e => {
                                    const newExamBoard = e.target.value as EXAM_BOARD;
                                    dispatch(transientUserContextSlice.actions.setStage((currentStage ?? STAGE.ALL) as STAGE));
                                    dispatch(transientUserContextSlice.actions.setExamBoard(newExamBoard));
                                }}
                            >
                                {onlyOneBoard && currentExamBoard === onlyOneBoard.value
                                    ? <option value={onlyOneBoard.value}>{onlyOneBoard.label}</option>
                                    : getFilteredExamBoardOptions({byStages: currentStages, includeNullOptions: true})
                                        .map(item => <option key={item.value} value={item.value}>{item.label}</option>)
                                }
                            </Input>
                        </>
                    }

                    <i id={`viewing-context-explanation`} className={classNames("icon icon-info icon-sm ms-3 me-2", siteSpecific("icon-color-grey", "icon-color-black"))} />
                    <UncontrolledTooltip placement="bottom" target={`viewing-context-explanation`}>
                        You are seeing {stagesString(currentStages)}{isAda && userViewingContext.contexts[0].examBoard ? ` - ${examBoardLabelMap[userViewingContext.contexts[0].examBoard]}` : ""}
                        &nbsp;content.&nbsp;
                        {formatContextExplanation(userViewingContext.explanation.stage, userViewingContext.explanation.examBoard, currentStages.length > 1)}&nbsp;
                        {isAda && !isLoggedIn(user) && hasDefaultPreferences(userViewingContext.contexts) ?
                            "Log in or sign up to save your viewing preferences." : ""
                        }
                    </UncontrolledTooltip>
                </div>
            </div>
        </div>;
    }
};
