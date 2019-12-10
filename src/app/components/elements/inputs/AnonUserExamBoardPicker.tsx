import React, {ChangeEvent} from "react";
import {FormGroup, Input, Label} from "reactstrap";
import {determineCurrentExamBoard} from "../../../services/examBoard";
import {EXAM_BOARD} from "../../../services/constants";
import {useDispatch, useSelector} from "react-redux";
import {setAnonUser} from "../../../state/actions";
import {AppState} from "../../../state/reducers";

interface AnonUserExamBoardPicker {className?: string; hideLabel?: boolean}

export const AnonUserExamBoardPicker = ({className, hideLabel = true}: AnonUserExamBoardPicker) => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user || null);
    const currentExamBoardPreference = useSelector((state: AppState) => state && state.currentExamBoardPreference || null);

    return <React.Fragment>
        {(!(user && user.loggedIn) || user.examBoard == EXAM_BOARD.OTHER) && <FormGroup className={className}>
            {!hideLabel && <Label className="d-inline-block pr-2" for="examBoardSelect">Exam Board</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" name="select" id="examBoardSelect"
                value={determineCurrentExamBoard(user, currentExamBoardPreference)}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const examBoard = event.target.value;
                    if (examBoard in EXAM_BOARD) {
                        dispatch(setAnonUser(examBoard as EXAM_BOARD));
                    }
                }}
                {...(hideLabel ? {'aria-label': "Exam Board"} : {})}
            >
                {/*<option></option> This was not an option although we should probably support it */}
                <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
            </Input>
        </FormGroup>}
    </React.Fragment>
};
