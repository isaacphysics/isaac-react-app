import React, {ChangeEventHandler, useEffect} from "react";
import {connect} from "react-redux";
import seedrandom from "seedrandom";
import {requestConstantsUnits, setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacNumericQuestionDTO, QuantityDTO} from "../../../IsaacApiTypes";
import {Input, Row, Col, Label} from "reactstrap";

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

function selectUnits(doc: IsaacNumericQuestionDTO, questionId: string, units?: string[], userId?: number): string[] {
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

    const unitsToShow: string[] = [];
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
    unitsToShow.unshift("", "None");
    return unitsToShow;
}

function wrapUnitForSelect(unit?: string): string {
    switch (unit) {
        case undefined:
            return "";
        case "":
            return "None";
        default:
            return unit;
    }
}

function unwrapUnitFromSelect(unit: string): string|undefined {
    switch (unit) {
        case "None":
            return "";
        case "":
            return undefined;
        default:
            return unit;
    }
}

type Unwrapper = (item: string) => string | undefined;

const IsaacNumericQuestionComponent = (props: IsaacNumericQuestionProps) => {
    const {doc, userId, questionId, units, currentAttempt, setCurrentAttempt, requestConstantsUnits} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value;
    const currentAttemptUnits = currentAttempt && currentAttempt.units;

    useEffect((): void => {
        requestConstantsUnits();
    }, [requestConstantsUnits]);
    const selectedUnits = selectUnits(doc, questionId, units, userId);

    function update(what: "value"|"units", f?: Unwrapper): ChangeEventHandler<HTMLInputElement> {
        return (event): void => {
            let attempt = {
                type: "quantity",
                value: currentAttemptValue,
                units: currentAttemptUnits
            };
            attempt[what] = f !== undefined ? f(event.target.value) : event.target.value;
            setCurrentAttempt(questionId, attempt);
        };
    }

    return (
        <div>
            <h3><IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding} children={doc.children} /></h3>
            <Row>
                <Col sm={3}>
                    <Label>
                        Value
                        <br />
                        <Input type="text" placeholder="Type your answer here." value={currentAttemptValue || ""}
                            onChange={update("value")}
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
                            <Input type="select" value={wrapUnitForSelect(currentAttemptUnits)}
                                onChange={update("units", unwrapUnitFromSelect)}>
                                {selectedUnits && selectedUnits.map((unit, index) =>
                                    <option key={index}>{unit}</option>
                                )}
                            </Input>
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
