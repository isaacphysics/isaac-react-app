import React from "react";
import {FormGroup, Input, Label} from "reactstrap";
import {getFilteredExamBoardOptions, getFilteredStages, useUserContext} from "../../../services/userContext";
import {EXAM_BOARD, EXAM_BOARD_NULL_OPTIONS, STAGE} from "../../../services/constants";
import {useDispatch, useSelector} from "react-redux";
import {setTransientExamBoardPreference, setTransientStagePreference} from "../../../state/actions";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";
import {AppState} from "../../../state/reducers";
import {isLoggedIn} from "../../../services/user";

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useDispatch();
    const {BETA_FEATURE: betaFeature} = useSelector((state: AppState) => state?.userPreferences) || {};
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();

    const showStageSelector = betaFeature?.AUDIENCE_CONTEXT;
    const showExamBoardSelector = SITE_SUBJECT === SITE.CS && (
        betaFeature?.AUDIENCE_CONTEXT ||
        !isLoggedIn(user) ||
        user.examBoard === undefined ||
        EXAM_BOARD_NULL_OPTIONS.has(user.examBoard)
    );

    return <div className="d-flex">
        {/* Stage Selector */}
        {showStageSelector && <FormGroup className={`${showExamBoardSelector ? "mr-2" : ""} ${className}`}>
            {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-stage-select">Stage</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" id="uc-stage-select"
                aria-label={hideLabels ? "Stage" : undefined}
                value={userContext.stage}
                onChange={e => dispatch(setTransientStagePreference(e.target.value as STAGE))}
            >
                {getFilteredStages(false).map(item =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )}
            </Input>
        </FormGroup>}

        {/* Exam Board Selector */}
        {showExamBoardSelector && <FormGroup className={className}>
            {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="uc-exam-board-select">Exam Board</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" id="uc-exam-board-select"
                aria-label={hideLabels ? "Exam Board" : undefined}
                value={userContext.examBoard}
                onChange={e => dispatch(setTransientExamBoardPreference(e.target.value as EXAM_BOARD))}
            >
                {getFilteredExamBoardOptions([userContext.stage], false, betaFeature?.AUDIENCE_CONTEXT).map(item =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )}
            </Input>
        </FormGroup>}
    </div>;
};
