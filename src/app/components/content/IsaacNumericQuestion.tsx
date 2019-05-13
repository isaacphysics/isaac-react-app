import React, {FormEvent, useEffect, useState} from "react";
import {connect} from "react-redux";
import seedrandom from "seedrandom";
import {requestConstantsUnits, setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacNumericQuestionDTO, QuantityDTO} from "../../../IsaacApiTypes";
import {Input, Row, Col, Label, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from "reactstrap";
import {TrustedHtml} from "./TrustedHtml";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    const userId = state && state.user && state.user.id || undefined;
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
}

function selectUnits(doc: IsaacNumericQuestionDTO, questionId: string, units?: string[], userId?: number): (string|undefined)[] {
    const seed = userId + "|" + questionId;
    const rand = seedrandom(seed);

    function randInt(size: number): number {
        return Math.floor(rand.double() * size);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    function pick(arr: any[]): any {
        if (arr.length === 0) return null;
        const index = randInt(arr.length);
        return arr.splice(index, 1)[0];
    }

    function shuffle(arr: any[]): void {
        let i = arr.length;
        while (--i > 0) {
            const j = randInt(i);
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

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
    const {doc, userId, questionId, units, currentAttempt, setCurrentAttempt, requestConstantsUnits} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value;
    const currentAttemptUnits = currentAttempt && currentAttempt.units;

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
        <div>
            <h3><IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding} children={doc.children} /></h3>
            <Row>
                <Col sm={3}>
                    <Label>
                        Value
                        <br />
                        <Input type="text" placeholder="Type your answer here." value={currentAttemptValue || ""}
                            onChange={updateValue}
                        />
                    </Label>
                    <br />
                    <small>Please answer to an appropriate number of significant figures.</small>
                </Col>
                {doc.requireUnits &&
                <Col sm={3}>
                    <Label>
                        Units
                        <br/>
                        <Dropdown isOpen={isOpen} toggle={() => {setIsOpen(!isOpen);}}>
                            <DropdownToggle caret>
                                <TrustedHtml span html={wrapUnitForSelect(currentAttemptUnits)}/>
                            </DropdownToggle>
                            <DropdownMenu right>
                                {selectedUnits && selectedUnits.map((unit) =>
                                    <DropdownItem key={wrapUnitForSelect(unit)}
                                        className={unit == currentAttemptUnits ? "btn btn-primary" : null}
                                        onClick={(e: FormEvent) => {updateUnits(unit); e.preventDefault();}}>
                                        <TrustedHtml span html={wrapUnitForSelect(unit)}/>
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    </Label>
                    <br />
                    <small>Please choose an appropriate unit of measurement.</small>
                </Col>
                }
            </Row>
        </div>
    );
};

export const IsaacNumericQuestion = connect(stateToProps, dispatchToProps)(IsaacNumericQuestionComponent);
