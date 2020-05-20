import React, {FormEvent, useEffect, useState} from "react";
import {connect} from "react-redux";
import seed from "math-random-seed";
import {requestConstantsUnits, setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO} from "../../../IsaacApiTypes";
import {Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Label, Row} from "reactstrap";
import {TrustedHtml} from "../elements/TrustedHtml";
import {questions} from "../../state/selectors";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const question = questions.selectQuestionPart(questionId)(state);
    const userId = state && state.user && state.user.loggedIn && state.user.id || undefined;
    const units = state && state.constants && state.constants.units || undefined;
    const props = {userId, units};
    return question ? {currentAttempt: question.currentAttempt, ...props} : {...props};
};
const dispatchToProps = {setCurrentAttempt, requestConstantsUnits};

interface IsaacNumericQuestionProps {
    doc: IsaacNumericQuestionDTO;
    userId?: number;
    units?: string[];
    questionId: string;
    currentAttempt?: QuantityDTO;
    setCurrentAttempt: (questionId: string, attempt: QuantityDTO) => void;
    requestConstantsUnits: () => void;
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

const IsaacNumericQuestionComponent = (props: IsaacNumericQuestionProps) => {
    const {doc, userId, questionId, units, currentAttempt, setCurrentAttempt, requestConstantsUnits, validationResponse} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value;
    const currentAttemptUnits = currentAttempt && currentAttempt.units;

    const currentAttemptValueWrong = validationResponse && !validationResponse.correctValue;
    const currentAttemptUnitsWrong = validationResponse && !validationResponse.correctUnits;

    useEffect((): void => {
        requestConstantsUnits();
    }, [requestConstantsUnits]);
    const selectedUnits = selectUnits(doc, questionId, units, userId);

    function updateValue(event: FormEvent<HTMLInputElement>) {
        let attempt = {
            type: "quantity",
            value: event.currentTarget.value,
            units: currentAttemptUnits
        };
        setCurrentAttempt(questionId, attempt);
    }

    function updateUnits(units?: string) {
        let attempt = {
            type: "quantity",
            value: currentAttemptValue,
            units: units
        };
        setCurrentAttempt(questionId, attempt);
    }

    let [isOpen, setIsOpen] = useState(false);

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

export const IsaacNumericQuestion = connect(stateToProps, dispatchToProps)(IsaacNumericQuestionComponent);
