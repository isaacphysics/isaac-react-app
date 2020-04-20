import React, {ChangeEvent} from "react";
import {FormGroup, Input, Label} from "reactstrap";
import {useCurrentExamBoard} from "../../../services/examBoard";
import {EXAM_BOARD} from "../../../services/constants";
import {useDispatch, useSelector} from "react-redux";
import {setTempExamBoard} from "../../../state/actions";
import {AppState} from "../../../state/reducers";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";

export const TempExamBoardPicker = ({className, hideLabel = true}: {className?: string; hideLabel?: boolean}) => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user || null);
    const currentExamBoard = useCurrentExamBoard();

    return SITE_SUBJECT === SITE.CS ? <React.Fragment>
        {(!user?.loggedIn || user.examBoard === undefined || user.examBoard === EXAM_BOARD.OTHER) && <FormGroup className={className}>
            {!hideLabel && <Label className="d-inline-block pr-2" for="examBoardSelect">Exam Board</Label>}
            <Input
                className="w-auto d-inline-block pl-1 pr-0" type="select" name="select" id="examBoardSelect"
                value={currentExamBoard}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const examBoard = event.target.value;
                    if (examBoard in EXAM_BOARD) {
                        dispatch(setTempExamBoard(examBoard as EXAM_BOARD));
                    }
                }}
                {...(hideLabel ? {'aria-label': "Exam Board"} : {})}
            >
                <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
            </Input>
        </FormGroup>}
    </React.Fragment> : null;
};
