import React, {ChangeEvent} from "react";
import {FormGroup, Input, Label} from "reactstrap";
import {determineExamBoardFrom} from "../../services/examBoard";
import {EXAM_BOARD} from "../../services/constants";
import {useDispatch, useSelector} from "react-redux";
import {setAnonUserPreferences} from "../../state/actions";
import {AppState} from "../../state/reducers";

interface UserExamBoardPicker {anonOnly?: boolean; className?: string; showLabel?: boolean}

export const UserExamBoardPicker = ({anonOnly = false, className, showLabel = true}: UserExamBoardPicker) => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user || null);
    const userPreferences = useSelector((state: AppState) => state && state.userPreferences || null);

    return <React.Fragment>
        {!(anonOnly && user && user.loggedIn) && <FormGroup className={className}>
            {showLabel && <Label className="d-inline-block pr-2" for="examBoardSelect">Exam Board</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" name="select" id="examBoardSelect"
                value={determineExamBoardFrom(userPreferences)}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const examBoardPreferences = event.target.value == EXAM_BOARD.AQA ?
                        {[EXAM_BOARD.AQA]: true, [EXAM_BOARD.OCR]: false} :
                        {[EXAM_BOARD.AQA]: false, [EXAM_BOARD.OCR]: true};
                    dispatch(setAnonUserPreferences(
                        Object.assign(userPreferences || {}, {EXAM_BOARD: examBoardPreferences})));
                }}
            >
                {/*<option></option> This was not an option although we should probably support it */}
                <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
            </Input>
        </FormGroup>}
    </React.Fragment>
};
