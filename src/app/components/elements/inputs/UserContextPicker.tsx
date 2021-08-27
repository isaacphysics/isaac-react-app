import React from "react";
import {CustomInput, FormGroup, Input, Label} from "reactstrap";
import {
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    useUserContext
} from "../../../services/userContext";
import {EXAM_BOARD, EXAM_BOARD_NULL_OPTIONS, STAGE, STAGE_NULL_OPTIONS} from "../../../services/constants";
import {useDispatch, useSelector} from "react-redux";
import {
    setTransientExamBoardPreference,
    setTransientShowOtherContentPreference,
    setTransientStagePreference
} from "../../../state/actions";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";
import {history} from "../../../services/history";
import queryString from "query-string";
import {useQueryParams} from "../../../services/reactRouterExtension";

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useDispatch();
    const qParams = useQueryParams();
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();
    const segueEnvironment = useSelector(selectors.segue.environmentOrUnknown);

    const showHideOtherContentSelector = SITE_SUBJECT === SITE.CS && segueEnvironment === "DEV";
    const showStageSelector = getFilteredStageOptions({byUser: user}).length > 1;
    const showExamBoardSelector = SITE_SUBJECT === SITE.CS && getFilteredExamBoardOptions({byUser: user}).length > 1;

    const filteredExamBoardOptions = getFilteredExamBoardOptions({byUser: user, byStages: [userContext.stage], includeNullOptions: true});
    const filteredStages = getFilteredStageOptions({byUser: user, includeNullOptions: true});

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
                    if (STAGE_NULL_OPTIONS.has(e.target.value as STAGE)) {delete newParams.stage;}
                    if (SITE_SUBJECT === SITE.CS) {
                        // drive exam board selection so that it is a valid option
                        const examBoard = getFilteredExamBoardOptions({byUser: user, byStages: [e.target.value as STAGE]})[0]?.value || EXAM_BOARD.NONE;
                        if (!EXAM_BOARD_NULL_OPTIONS.has(examBoard)) {newParams.examBoard = examBoard;}
                        dispatch(setTransientExamBoardPreference(examBoard));
                    }
                    history.push({search: queryString.stringify(newParams, {encode: false})});
                    dispatch(setTransientStagePreference(e.target.value as STAGE));
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
                    const newParams = {...qParams, examBoard: e.target.value};
                    if (EXAM_BOARD_NULL_OPTIONS.has(e.target.value as EXAM_BOARD)) {delete newParams.examBoard;}
                    history.push({search: queryString.stringify(newParams, {encode: false})});
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
    </div>;
};
