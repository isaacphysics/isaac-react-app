import React from "react";
import * as RS from "reactstrap";
import {CustomInput, FormGroup, Input, Label} from "reactstrap";
import {getFilteredExamBoardOptions, getFilteredStageOptions, useUserContext} from "../../../services/userContext";
import {EXAM_BOARD, examBoardLabelMap, STAGE, stageLabelMap} from "../../../services/constants";
import {useAppDispatch, useAppSelector} from "../../../state/store";
import {
    setTransientExamBoardPreference,
    setTransientShowOtherContentPreference,
    setTransientStagePreference
} from "../../../state/actions";
import {isCS} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";
import {history} from "../../../services/history";
import queryString from "query-string";
import {useQueryParams} from "../../../services/reactRouterExtension";

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useAppDispatch();
    const qParams = useQueryParams();
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();
    const segueEnvironment = useAppSelector(selectors.segue.environmentOrUnknown);

    const filteredExamBoardOptions = getFilteredExamBoardOptions({byUser: user, byStages: [userContext.stage], includeNullOptions: true});
    const filteredStages = getFilteredStageOptions({byUser: user, includeNullOptions: true});

    const unusual = {
        stage: !filteredStages.map(s => s.value).includes(userContext.stage),
        examBoard: isCS && !filteredExamBoardOptions.map(s => s.value).includes(userContext.examBoard),
    };
    const showUnusualContextMessage = unusual.stage || unusual.examBoard;
    const showHideOtherContentSelector = isCS && segueEnvironment === "DEV";
    const showStageSelector = getFilteredStageOptions({byUser: user}).length > 1 || showUnusualContextMessage;
    const showExamBoardSelector = isCS && (getFilteredExamBoardOptions({byUser: user}).length > 1 || showUnusualContextMessage);


    return <div className="d-flex">
        {/* Show other content Selector */}
        {showHideOtherContentSelector && <FormGroup className={`mr-2 ${className}`}>
            <Label className="d-inline-block pr-4" htmlFor="uc-show-other-content-check">Show other content? </Label>
            <CustomInput
                className="w-auto d-inline-block pl-1 pr-0" type="checkbox" id="uc-show-other-content-check"
                checked={userContext.showOtherContent}
                onChange={e => dispatch(setTransientShowOtherContentPreference(e.target.checked))}
            />
        </FormGroup>}

        {/* Stage Selector */}
        {showStageSelector && <FormGroup className={`${showExamBoardSelector ? "mr-2" : ""} ${className}`}>
            {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-stage-select">Stage</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" id="uc-stage-select"
                aria-label={hideLabels ? "Stage" : undefined}
                value={userContext.stage}
                onChange={e => {
                    const newParams: {[key: string]: unknown} = {...qParams, stage: e.target.value};
                    const stage = e.target.value as STAGE;
                    if (isCS) {
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
                        dispatch(setTransientExamBoardPreference(examBoard));
                    }
                    history.push({search: queryString.stringify(newParams, {encode: false})});
                    dispatch(setTransientStagePreference(stage));
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
        {showExamBoardSelector && <FormGroup className={className}>
            {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-exam-board-select">Exam Board</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" id="uc-exam-board-select"
                aria-label={hideLabels ? "Exam Board" : undefined}
                value={userContext.examBoard}
                onChange={e => {
                    history.push({search: queryString.stringify({...qParams, examBoard: e.target.value}, {encode: false})});
                    dispatch(setTransientExamBoardPreference(e.target.value as EXAM_BOARD))
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

        {showUnusualContextMessage && <div className="mt-2 ml-1">
            <span id={`unusual-viewing-context-explanation`} className="icon-help mx-1" />
            <RS.UncontrolledTooltip placement="bottom" target={`unusual-viewing-context-explanation`}>
                You are seeing {stageLabelMap[userContext.stage]} {isCS ? examBoardLabelMap[userContext.examBoard] : ""}{" "}
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
