import React, {useEffect, useState} from "react";
import {Col, FormGroup, Input, Label, Row, UncontrolledTooltip} from "reactstrap";
import {
    CONTEXT_SOURCE,
    EXAM_BOARD,
    examBoardLabelMap,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    isAda,
    isLoggedIn,
    isPhy,
    isStaff,
    SITE_TITLE_SHORT,
    siteSpecific,
    STAGE,
    stageLabelMap,
    useQueryParams,
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

const formatContextExplanation = (stageExplanation: CONTEXT_SOURCE, examBoardExplanation: CONTEXT_SOURCE) => {
    if (isAda) {
        if (stageExplanation == examBoardExplanation) {
            return `The stage and exam board were specified by ${contextExplanationMap[stageExplanation]}.`;
        } else {
            return `The stage was specified by ${contextExplanationMap[stageExplanation]} and the exam board by 
            ${contextExplanationMap[examBoardExplanation]}.`;
        }
    } else {
        return `The stage was specified by ${contextExplanationMap[stageExplanation]}.`;
    }
};

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useAppDispatch();
    const qParams = useQueryParams();
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();

    const filteredExamBoardOptions = getFilteredExamBoardOptions({byUser: user, byStages: [userContext.stage], includeNullOptions: true});
    const allStages = getFilteredStageOptions({includeNullOptions: true});

    const onlyOneBoard : {label: string, value: EXAM_BOARD} | undefined = filteredExamBoardOptions.length === 2 && filteredExamBoardOptions.map(eb => eb.value).includes(EXAM_BOARD.ALL)
        ? filteredExamBoardOptions.filter(eb => eb.value !== EXAM_BOARD.ALL)[0]
        : undefined;

    const [currentStage, setCurrentStage] = useState<STAGE>(userContext.stage);

    useEffect(() => {
        setCurrentStage(userContext.stage);
    }, [userContext.stage]);

    if (isAda && !isLoggedIn(user) || isStaff(user)) {
        return <Col className={`d-flex flex-column w-100 px-0 mt-2 context-picker-container no-print ${className}`}>
            <Row sm={12} md={7} lg={siteSpecific(7, 8)} xl={siteSpecific(7, 9)} className={`d-flex m-0 p-0 justify-content-md-end`}>
                {/* Stage Selector */}
                <div className={classNames("form-group w-100 d-flex justify-content-end m-0", {"mb-3": isAda}, {"align-items-center": isPhy})}>
                    {!hideLabels && <Label className="d-inline-block pe-2" htmlFor="uc-stage-select">Stage</Label>}
                    {!userContext.hasDefaultPreferences && (userContext.explanation.stage == CONTEXT_SOURCE.TRANSIENT || userContext.explanation.examBoard == CONTEXT_SOURCE.TRANSIENT) &&
                        <button className={"icon-reset mt-2"} aria-label={"Reset viewing context"} onClick={() => {
                            dispatch(transientUserContextSlice.actions.setExamBoard(undefined));
                            dispatch(transientUserContextSlice.actions.setStage(undefined));
                        }}/>
                    }
                    <Input
                        className={classNames("flex-grow-1 d-inline-block ps-2 pe-0", { "mb-2 me-1": isAda })}
                        type="select" id="uc-stage-select"
                        aria-label={hideLabels ? "Stage" : undefined}
                        value={userContext.stage}
                        disabled={userContext.isFixedContext}
                        onChange={e => {
                            const newParams: { [key: string]: unknown } = {...qParams, stage: e.target.value};
                            const stage = e.target.value as STAGE;
                            if (isAda) {
                                // Derive exam board selection so that it is a valid option
                                // Try to use default preferences (Stage All, Ada) otherwise default to All.
                                let examBoard = stage === STAGE.ALL ? EXAM_BOARD.ADA : EXAM_BOARD.ALL;
                                const possibleExamBoards =
                                    getFilteredExamBoardOptions({byUser: user, byStages: [stage], includeNullOptions: true})
                                        .map(eb => eb.value);
                                // If we have possible valid exam board options but All is not one of them, use one of those.
                                if (possibleExamBoards.length > 0 && !possibleExamBoards.includes(EXAM_BOARD.ALL)) {
                                    examBoard = possibleExamBoards[0];
                                }
                                // If we only have one possible exam board besides All, use that.
                                else if (possibleExamBoards.length === 2 && possibleExamBoards.includes(EXAM_BOARD.ALL)) {
                                    examBoard = possibleExamBoards.filter(eb => eb !== EXAM_BOARD.ALL)[0];
                                }
                                newParams.examBoard = examBoard;
                                dispatch(transientUserContextSlice.actions.setExamBoard(examBoard));
                            }
                            dispatch(transientUserContextSlice.actions.setStage(stage));
                        }}
                    >
                        {allStages.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </Input>
                    {isAda &&
                        <>
                            {/* Exam Board Selector */}
                            {!hideLabels && <Label className="d-inline-block pe-2" htmlFor="uc-exam-board-select">Exam Board</Label>}
                            <Input
                                className={`flex-grow-1 d-inline-block ps-2 pe-0 mb-2 ms-1`}
                                type="select" id="uc-exam-board-select"
                                aria-label={hideLabels ? "Exam Board" : undefined}
                                value={userContext.examBoard}
                                onChange={e => {
                                    dispatch(transientUserContextSlice.actions.setExamBoard(e.target.value as EXAM_BOARD));
                                }}
                            >
                                {onlyOneBoard
                                    ? <option value={onlyOneBoard.value}>{onlyOneBoard.label}</option>
                                    : getFilteredExamBoardOptions({byStages: [currentStage], includeNullOptions: true})
                                        .map(item => <option key={item.value} value={item.value}>{item.label}</option>)
                                }
                            </Input>
                        </>
                    }

                    <div className="mt-2 ms-1">
                        <i id={`viewing-context-explanation`} className={siteSpecific("icon icon-info layered icon-color-grey ms-1", "icon-help mx-1")}/>
                        <UncontrolledTooltip placement="bottom" target={`viewing-context-explanation`}>
                            You are seeing {stageLabelMap[userContext.stage]}{isAda ? ` - ${examBoardLabelMap[userContext.examBoard]}` : ""}
                            &nbsp;content.&nbsp;
                            {formatContextExplanation(userContext.explanation.stage, userContext.explanation.examBoard)}&nbsp;
                            {isAda && !isLoggedIn(user) && !userContext.hasDefaultPreferences ?
                                "Log in or sign up to save your viewing preferences." : ""
                            }
                        </UncontrolledTooltip>
                    </div>
                </div>
            </Row>
        </Col>;
    }
};
