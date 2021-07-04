import React, {ChangeEvent} from "react";
import {FormGroup, Input, Label} from "reactstrap";
import {useUserContext} from "../../../services/userContext";
import {EXAM_BOARD} from "../../../services/constants";
import {useDispatch, useSelector} from "react-redux";
import {setTempExamBoard} from "../../../state/actions";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";
import {AppState} from "../../../state/reducers";

export const UserContextPicker = ({className, hideLabels = true}: {className?: string; hideLabels?: boolean}) => {
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();
    const {BETA_FEATURE: betaFeature} = useSelector((state: AppState) => state?.userPreferences) || {};

    const showStageSelector = betaFeature?.AUDIENCE_CONTEXT;
    const showExamBoardSelector = SITE_SUBJECT === SITE.CS && (
        betaFeature?.AUDIENCE_CONTEXT ||
        !user?.loggedIn ||
        user.examBoard === undefined ||
        user.examBoard === EXAM_BOARD.OTHER
    );

    return <React.Fragment>
        {/* Stage Selector */}
        {showStageSelector && <FormGroup className={className}>
            {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="ucStageSelect">Stage</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" name="select" id="ucStageSelect"
                aria-label={hideLabels ? "Stage" : undefined}
            >
                <option value="">A Level</option>
            </Input>
        </FormGroup>}

        {/* Exam Board Selector */}
        {showExamBoardSelector && <FormGroup className={className}>
            {!hideLabels && <Label className="d-inline-block pr-2" htmlFor="ucExamBoardSelect">Exam Board</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" name="select" id="ucExamBoardSelect"
                aria-label={hideLabels ? "Exam Board" : undefined}
                value={userContext.examBoard}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (event.target.value in EXAM_BOARD) {
                        dispatch(setTempExamBoard(event.target.value as EXAM_BOARD));
                    }
                }}
            >
                <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
            </Input>
        </FormGroup>}
    </React.Fragment>;
};
