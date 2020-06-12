import React, {FormEvent, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import seed from "math-random-seed";
import {requestConstantsUnits, setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO} from "../../../IsaacApiTypes";
import {Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Label, Row} from "reactstrap";
import {TrustedHtml} from "../elements/TrustedHtml";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";

interface IsaacNumericQuestionProps {
    doc: IsaacNumericQuestionDTO;
    questionId: string;
    validationResponse?: QuantityValidationResponseDTO;
}

function selectUnits(doc: IsaacNumericQuestionDTO, questionId: string, units?: string[], userId?: number): (string|undefined)[] {
    const seedValue = userId + "|" + questionId;
    const random = seed(seedValue);

    function randInt(size: number): number {
        return Math.floor(random() * size);
    }

    function pick<T>(arr: T[]): T {
        if (arr.length === 0) return null as unknown as T;
        const index = randInt(arr.length);
        return arr.splice(index, 1)[0];
    }

    function shuffle<T>(arr: T[]): void {
        let i = arr.length;
        while (--i > 0) {
            const j = randInt(i);
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    const unitsToShow: (string|undefined)[] = [];
    function addUnitToShow(unit: string): void {
        unit = unit.trim();
        if (unit === "" || unitsToShow.includes(unit)) return;
        unitsToShow.push(unit);
    }

    function addUpTo(from: string[], limit: number): void {
        from = from.slice(0);
        while (from.length > 0 && unitsToShow.length < limit) {
            addUnitToShow(pick(from));
        }
    }

    if (doc.knownUnits) {
        // Include all known units, that is, units used in any answers
        doc.knownUnits.forEach(addUnitToShow);
    }

    if (doc.availableUnits) {
        // Add availableUnits to the list until we reach 6 units or run out of available units
        addUpTo(doc.availableUnits, 6);
    }

    if (units) {
        addUpTo(units, 6);
    }

    shuffle(unitsToShow);
    unitsToShow.unshift(undefined, "");
    return unitsToShow;
}

function wrapUnitForSelect(unit?: string): string {
    switch (unit) {
        case undefined:
            return "&nbsp;";
        case "":
            return "None";
        default:
            return "$\\units{" + unit + "}$";
    }
}

export const IsaacNumericQuestion = ({doc, questionId, validationResponse}: IsaacNumericQuestionProps) => {
    const dispatch = useDispatch();
    const userId = useSelector((state: AppState) => state?.user?.loggedIn && state.user.id || undefined);
    const units = useSelector((state: AppState) => state?.constants?.units || undefined);
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);

    const currentAttempt = questionPart?.currentAttempt as QuantityDTO;
    const currentAttemptValue = currentAttempt?.value;
    const currentAttemptUnits = currentAttempt?.units;
    const currentAttemptValueWrong = validationResponse && !validationResponse.correctValue;
    const currentAttemptUnitsWrong = validationResponse && !validationResponse.correctUnits;

    useEffect((): void => {dispatch(requestConstantsUnits());}, [dispatch]);
    const selectedUnits = selectUnits(doc, questionId, units, userId);

    function updateValue(event: FormEvent<HTMLInputElement>) {
        const attempt = {
            type: "quantity",
            value: event.currentTarget.value,
            units: currentAttemptUnits
        };
        dispatch(setCurrentAttempt(questionId, attempt));
    }

    function updateUnits(units?: string) {
        const attempt = {
            type: "quantity",
            value: currentAttemptValue,
            units: units
        };
        dispatch(setCurrentAttempt(questionId, attempt));
    }

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="numeric-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            <Row className="no-print">
                <Col className="d-flex flex-column flex-sm-row flex-md-column flex-lg-row">
                    <div className="w-100 w-sm-50 w-md-100 w-lg-50">
                        <Label className="w-100">
                            Value <br />
                            <Input type="text" value={currentAttemptValue || ""} invalid={currentAttemptValueWrong || undefined}
                                onChange={updateValue}
                            />
                        </Label>
                    </div>
                    {doc.requireUnits && <div className="unit-selection w-100 w-sm-50 w-md-100 w-lg-25">
                        <Label className="w-100 ml-sm-2 ml-md-0 ml-lg-2">
                            Units <br/>
                            <Dropdown isOpen={isOpen} toggle={() => {setIsOpen(!isOpen);}}>
                                <DropdownToggle caret className="px-2 py-1" color={currentAttemptUnitsWrong ? "danger" : undefined}>
                                    <TrustedHtml span html={wrapUnitForSelect(currentAttemptUnits)}/>
                                </DropdownToggle>
                                <DropdownMenu right>
                                    {selectedUnits.map((unit) =>
                                        <DropdownItem key={wrapUnitForSelect(unit)}
                                            className={unit == currentAttemptUnits ? "btn btn-primary bg-grey selected" : ""}
                                            onClick={(e: FormEvent) => {updateUnits(unit); e.preventDefault();}}>
                                            <TrustedHtml span html={wrapUnitForSelect(unit)}/>
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </Label>
                    </div>}
                </Col>
            </Row>
        </div>
    );
};
