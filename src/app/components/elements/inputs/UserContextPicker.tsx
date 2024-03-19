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
    useGetSegueEnvironmentQuery
} from "../../../state";
import queryString from "query-string";

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useAppDispatch();
    const qParams = useQueryParams();
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();

    const filteredExamBoardOptions = getFilteredExamBoardOptions({byUser: user, byStages: [userContext.stage], includeNullOptions: true});
    const filteredStages = getFilteredStageOptions({byUser: user, includeNullOptions: true});

    const unusual = {
        stage: !filteredStages.map(s => s.value).includes(userContext.stage),
        examBoard: isAda && !filteredExamBoardOptions.map(s => s.value).includes(userContext.examBoard),
    };
    const showUnusualContextMessage = unusual.stage || unusual.examBoard;
    const showHideOtherContentSelector = isAda && segueEnvironment === "DEV";
    const showStageSelector = getFilteredStageOptions({byUser: user}).length > 1 || showUnusualContextMessage;
    const showExamBoardSelector = isAda && (getFilteredExamBoardOptions({byUser: user}).length > 1 || showUnusualContextMessage);


    return <div className="d-flex context-picker-container">
        <RS.Row className="m-0 w-100">
            {/* Other content Selector */}
            <RS.Col xs={{size: 12, order: 2}} lg={{size: 5, order: 0}} className="pl-0 pr-2 m-0 align-self-center pb-2">
                {showHideOtherContentSelector && <FormGroup className={`d-flex align-items-center m-0 float-lg-right ${className}`}>
                    <Label className="d-inline-block m-0" htmlFor="uc-show-other-content-check">Show other content? </Label>
                    <CustomInput
                        className="w-auto d-inline-block ml-2 pr-0" type="checkbox" id="uc-show-other-content-check"
                        checked={userContext.showOtherContent}
                        onChange={e => dispatch(transientUserContextSlice.actions.setShowOtherContent(e.target.checked))}
                    />
                </FormGroup>}
            </RS.Col>
            <RS.Col xs={12} lg={7} className={`d-flex m-0 mb-2 p-0 justify-content-lg-end ${className}`}> 
                {/* Stage Selector */}
                {showStageSelector && <FormGroup className={`${showExamBoardSelector ? "mr-2 mb-0" : ""} ${className}`}>
                    {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-stage-select">Stage</Label>}
                    <Input
                        className="w-auto d-inline-block pl-1 pr-0" type="select" id="uc-stage-select"
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
                </FormGroup>}

                {/* Exam Board Selector */}
                {showExamBoardSelector && <FormGroup className={`${className} mb-0`}>
                    {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-exam-board-select">Exam Board</Label>}
                    <Input
                        className="w-auto d-inline-block pl-1 pr-0" type="select" id="uc-exam-board-select"
                        aria-label={hideLabels ? "Exam Board" : undefined}
                        value={userContext.examBoard}
                        onChange={e => {
                            history.push({search: queryString.stringify({...qParams, examBoard: e.target.value}, {encode: false})});
                            dispatch(transientUserContextSlice.actions.setExamBoard(e.target.value as EXAM_BOARD));
                        }}
                    >
                        {filteredExamBoardOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        {/* If the userContext.examBoard is not in the user's normal list of options (following link with q. params) add it */}
                        {!filteredExamBoardOptions.map(s => s.value).includes(userContext.examBoard) &&
                            <option key={userContext.examBoard} value={userContext.examBoard}>
                                {"*"}
                                {getFilteredExamBoardOptions().filter(o => o.value === userContext.examBoard)[0]?.label}
                                {"*"}
                            </option>
                        }
                    </Input>
                </FormGroup>}
            </RS.Col>
        </RS.Row>

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
    </div>;
};
