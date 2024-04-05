import React from "react";
import * as RS from "reactstrap";
import {CustomInput, FormGroup, Input, Label} from "reactstrap";
import {
    EXAM_BOARD,
    examBoardLabelMap,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    history,
    isAda,
    siteSpecific,
    STAGE,
    stageLabelMap,
    useQueryParams,
    useUserContext
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
    const userContext = useUserContext();

    const filteredExamBoardOptions = getFilteredExamBoardOptions({byUser: user, byStages: [userContext.stage], includeNullOptions: true});
    const filteredStages = getFilteredStageOptions({byUser: user, includeNullOptions: true});

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

    return <RS.Col className={`d-flex flex-column w-100 px-0 mt-2 context-picker-container no-print ${className}`}>
        <RS.Row sm={12} md={7} lg={siteSpecific(7, 8)} xl={siteSpecific(7, 9)} className={`d-flex m-0 p-0 justify-content-md-end`}> 
            {/* Stage Selector */}
            <FormGroup className={`w-100 d-flex justify-content-end m-0`}>
                {showStageSelector && <>
                    {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-stage-select">Stage</Label>}
                    <Input
                        className={`flex-grow-1 d-inline-block pl-2 pr-0 mb-2 ${showExamBoardSelector ? "mr-1" : ""}`} type="select" id="uc-stage-select"
                        aria-label={hideLabels ? "Stage" : undefined}
                        value={userContext.stage}
                        onChange={e => {
                            const newParams: {[key: string]: unknown} = {...qParams, stage: e.target.value};
                            const stage = e.target.value as STAGE;
                            if (isAda) {
                                // Drive exam board selection so that it is a valid option - by default use All.
                                let examBoard = EXAM_BOARD.ALL;
                                const possibleExamBoards =
                                    getFilteredExamBoardOptions({byUser: user, byStages: [stage], includeNullOptions: true})
                                        .map(eb => eb.value);
                                // If we have possible valid exam board options but All is not one of them, use one of those.
                                if (possibleExamBoards.length > 0 && !possibleExamBoards.includes(EXAM_BOARD.ALL)) {
                                    examBoard = possibleExamBoards[0];
                                }
                                newParams.examBoard = examBoard;
                                dispatch(transientUserContextSlice.actions.setExamBoard(examBoard));
                            }
                            history.push({search: queryString.stringify(newParams, {encode: false})});
                            dispatch(transientUserContextSlice.actions.setStage(stage));
                        }}
                    >
                        {filteredStages.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        {/* If the userContext.stage is not in the user's normal list of options (following link with q. params) add it */}
                        {!filteredStages.map(s => s.value).includes(userContext.stage) &&
                            <option key={userContext.stage} value={userContext.stage}>
                                {"*"}
                                {getFilteredStageOptions().filter(o => o.value === userContext.stage)[0]?.label}
                                {"*"}
                            </option>
                        }
                    </Input>
                </>}

                {/* Exam Board Selector */}
                {showExamBoardSelector && <>
                    {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-exam-board-select">Exam Board</Label>}
                    <Input
                        className={`flex-grow-1 d-inline-block pl-2 pr-0 mb-2 ${showStageSelector ? "ml-1" : ""}`} type="select" id="uc-exam-board-select"
                        aria-label={hideLabels ? "Exam Board" : undefined}
                        value={userContext.examBoard}
                        onChange={e => {
                            history.push({search: queryString.stringify({...qParams, examBoard: e.target.value}, {encode: false})});
                            dispatch(transientUserContextSlice.actions.setExamBoard(e.target.value as EXAM_BOARD));
                        }}
                    >
                        {onlyOneBoard 
                            ? <option value={onlyOneBoard.value}>{onlyOneBoard.label}</option> 
                            : filteredExamBoardOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)
                        }
                        {/* If the userContext.examBoard is not in the user's normal list of options (following link with q. params) add it */}
                        {!filteredExamBoardOptions.map(s => s.value).includes(userContext.examBoard) &&
                            <option key={userContext.examBoard} value={userContext.examBoard}>
                                {"*"}
                                {getFilteredExamBoardOptions().filter(o => o.value === userContext.examBoard)[0]?.label}
                                {"*"}
                            </option>
                        }
                    </Input>
                </>}
            </FormGroup>
        </RS.Row>
        

        {/* "Show other content" selector */}
        {isAda && <RS.Row className="w-100 px-0 m-0 pb-2 justify-content-end">
            <FormGroup className="w-auto m-0">
                <Label className="d-inline-block m-0" htmlFor="uc-show-other-content-check">Show other content? </Label>
                <CustomInput
                    className="d-inline-block ml-2 pr-0" type="checkbox" id="uc-show-other-content-check"
                    checked={userContext.showOtherContent}
                    onChange={e => dispatch(transientUserContextSlice.actions.setShowOtherContent(e.target.checked))}
                />
            </FormGroup>
        </RS.Row>}

        {showUnusualContextMessage && <div className="mt-2 ml-1">
            <span id={`unusual-viewing-context-explanation`} className="icon-help mx-1" />
            <RS.UncontrolledTooltip placement="bottom" target={`unusual-viewing-context-explanation`}>
                You are seeing {stageLabelMap[userContext.stage]} {isAda ? examBoardLabelMap[userContext.examBoard] : ""}{" "}
                content, which is different to your account settings. <br />
                {unusual.stage && unusual.examBoard && <>
                    {userContext.explanation.stage === userContext.explanation.examBoard ?
                        `The stage and exam board were specified by your ${userContext.explanation.stage}.` :
                        `The stage was specified by your ${userContext.explanation.stage} and the exam board by your ${userContext.explanation.examBoard}.`}
                </>}
                {unusual.stage && !unusual.examBoard && `The stage was specified by your ${userContext.explanation.stage}.`}
                {unusual.examBoard && !unusual.stage && `The exam board was specified by your ${userContext.explanation.examBoard}.`}
            </RS.UncontrolledTooltip>
        </div>}
    </RS.Col>;
};
