import React, { useEffect, useState } from "react";
import * as RS from "reactstrap";
import {FormGroup, Input, Label} from "reactstrap";
import {
    EXAM_BOARD,
    examBoardLabelMap,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    history,
    isAda, isLoggedIn,
    isStaff,
    siteSpecific,
    STAGE,
    stageLabelMap,
    useQueryParams,
    useUserViewingContext
} from "../../../services";
import {
    selectors,
    transientUserContextSlice,
    useAppDispatch,
    useAppSelector,
} from "../../../state";
import queryString from "query-string";

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useAppDispatch();
    const qParams = useQueryParams();
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();

    const filteredExamBoardOptions = getFilteredExamBoardOptions({byUser: user, byStages: [userContext.stage], includeNullOptions: true});
    const filteredStages = getFilteredStageOptions({byUser: user, includeNullOptions: true});
    const allStages = getFilteredStageOptions();

    const unusual = {
        stage: !filteredStages.map(s => s.value).includes(userContext.stage),
        examBoard: isAda && !filteredExamBoardOptions.map(s => s.value).includes(userContext.examBoard),
    };
    const showUnusualContextMessage = unusual.stage || unusual.examBoard;
    const showStageSelector = getFilteredStageOptions({byUser: user}).length > 1 || showUnusualContextMessage;
    const showExamBoardSelector = isAda && (getFilteredExamBoardOptions({byUser: user}).length > 1 || showUnusualContextMessage);

    const onlyOneBoard : {label: string, value: EXAM_BOARD} | undefined = filteredExamBoardOptions.length === 2 && filteredExamBoardOptions.map(eb => eb.value).includes(EXAM_BOARD.ALL)
        ? filteredExamBoardOptions.filter(eb => eb.value !== EXAM_BOARD.ALL)[0]
        : undefined;

    const [currentStage, setCurrentStage] = useState<STAGE>(userContext.stage);

    useEffect(() => {
        setCurrentStage(userContext.stage);
    }, [userContext.stage]);

    if (isAda && !isLoggedIn(user) || isStaff(user)) {
        return <RS.Col className={`d-flex flex-column w-100 px-0 mt-2 context-picker-container no-print ${className}`}>
            <RS.Row sm={12} md={7} lg={siteSpecific(7, 8)} xl={siteSpecific(7, 9)} className={`d-flex m-0 p-0 justify-content-md-end`}> 
                {/* Stage Selector */}
                <FormGroup className={`form-group w-100 d-flex justify-content-end m-0`}>
                    {showStageSelector && <>
                        {!hideLabels && <Label className="d-inline-block pe-2" htmlFor="uc-stage-select">Stage</Label>}
                        <Input
                            className={`flex-grow-1 d-inline-block ps-2 pe-0 mb-2 ${showExamBoardSelector ? "me-1" : ""}`} type="select" id="uc-stage-select"
                            aria-label={hideLabels ? "Stage" : undefined}
                            value={userContext.stage}
                            onChange={e => {
                                const newParams: {[key: string]: unknown} = {...qParams, stage: e.target.value};
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
                    </>}

                    {/* Exam Board Selector */}
                    {showExamBoardSelector && <>
                        {!hideLabels && <Label className="d-inline-block pe-2" htmlFor="uc-exam-board-select">Exam Board</Label>}
                        <Input
                            className={`flex-grow-1 d-inline-block ps-2 pe-0 mb-2 ${showStageSelector ? "ms-1" : ""}`} type="select" id="uc-exam-board-select"
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
                    </>}
                    
                    {showUnusualContextMessage && <div className="mt-2 ms-1">
                        <span id={`unusual-viewing-context-explanation`} className="icon-help mx-1" />
                        <RS.UncontrolledTooltip placement="bottom" target={`unusual-viewing-context-explanation`}>
                            You are seeing {stageLabelMap[userContext.stage]} {isAda ? examBoardLabelMap[userContext.examBoard] : ""}{" "}
                            content, which is different to your account settings. <br />
                            {unusual.stage && unusual.examBoard && <>
                                {userContext.explanation.stage === userContext.explanation.examBoard ?
                                    `The stage and exam board were specified by ${userContext.explanation.stage}.` :
                                    `The stage was specified by ${userContext.explanation.stage} and the exam board by ${userContext.explanation.examBoard}.`}
                            </>}
                            {unusual.stage && !unusual.examBoard && `The stage was specified by ${userContext.explanation.stage}.`}
                            {unusual.examBoard && !unusual.stage && `The exam board was specified by ${userContext.explanation.examBoard}.`}
                        </RS.UncontrolledTooltip>
                    </div>}
                </FormGroup>
            </RS.Row>
        </RS.Col>;
    }
};
