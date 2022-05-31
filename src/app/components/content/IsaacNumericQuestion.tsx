import React, {FormEvent, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import Rand from 'rand-seed';
import {requestConstantsUnits} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO} from "../../../IsaacApiTypes";
import {
    Button,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Row,
    UncontrolledTooltip
} from "reactstrap";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {v4 as uuid_v4} from 'uuid';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";

function selectUnits(doc: IsaacNumericQuestionDTO, questionId: string, units?: string[], userId?: number): (string|undefined)[] {
    const seedValue = userId + "|" + questionId;
    const random = new Rand(seedValue);

    function randInt(size: number): number {
        return Math.floor(random.next() * size);
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
            return "\u00A0";
        case "":
            return "None";
        default:
            return "$\\units{" + unit + "}$";
    }
}

type IsaacNumericQuestionProps = IsaacQuestionProps<IsaacNumericQuestionDTO> & {validationResponse?: QuantityValidationResponseDTO};

export const IsaacNumericQuestion = ({doc, questionId, validationResponse, readonly}: IsaacNumericQuestionProps) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<QuantityDTO>(questionId);

    const currentAttemptValue = currentAttempt?.value;
    const currentAttemptUnits = currentAttempt?.units;
    const currentAttemptValueWrong = validationResponse && validationResponse.correctValue === false;
    const currentAttemptUnitsWrong = validationResponse && validationResponse.correctUnits === false;

    const dispatch = useDispatch();
    const userId = useSelector((state: AppState) => (state?.user?.loggedIn && state.user.id) || undefined);
    const units = useSelector((state: AppState) => state?.constants?.units || undefined);

    useEffect(() => {dispatch(requestConstantsUnits());}, [dispatch]);
    const selectedUnits = selectUnits(doc, questionId, units, userId);

    function updateValue(event: FormEvent<HTMLInputElement>) {
        const attempt = {
            type: "quantity",
            value: event.currentTarget.value,
            units: currentAttemptUnits
        };
        dispatch(dispatchSetCurrentAttempt(attempt));
    }

    function updateUnits(units?: string) {
        const attempt = {
            type: "quantity",
            value: currentAttemptValue,
            units: units
        };
        dispatch(dispatchSetCurrentAttempt(attempt));
    }

    const [isOpen, setIsOpen] = useState(false);

    const helpTooltipId = useMemo(() => `numeric-input-help-${uuid_v4()}`, []);

    const noDisplayUnit = doc.displayUnit == null || doc.displayUnit === "";

    return (
        <div className="numeric-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            <Row className="no-print">
                <Col className="d-flex flex-column flex-sm-row flex-md-column flex-lg-row">
                    <div className="numeric-value w-100 w-sm-50 w-md-100 w-lg-50">
                        <Label className="w-100">
                            Value <br />
                            <InputGroup>
                                <Input type="text" value={currentAttemptValue || ""} invalid={currentAttemptValueWrong || undefined}
                                       onChange={updateValue} readOnly={readonly}
                                />
                                {!readonly && <InputGroupAddon addonType="append">
                                    <Button type="button" className="numeric-help" size="sm" id={helpTooltipId}>?</Button>
                                    <UncontrolledTooltip placement="bottom" autohide={false} target={helpTooltipId}>
                                        Here are some examples of numbers you can write:<br /><br />
                                        3.7<br />
                                        3x10^14<br />
                                        2.8e12<br /><br />
                                        Do not use commas or spaces.
                                    </UncontrolledTooltip>
                                </InputGroupAddon>}
                            </InputGroup>
                        </Label>
                    </div>
                    {(doc.requireUnits || doc.displayUnit) && <div className="unit-selection w-100 w-sm-50 w-md-100 w-lg-25">
                        <Label className="w-100 ml-sm-2 ml-md-0 ml-lg-5">
                            Unit{noDisplayUnit && "s"} <br/>
                            <Dropdown disabled={readonly} isOpen={isOpen && noDisplayUnit} toggle={() => {setIsOpen(!isOpen);}}>
                                <DropdownToggle disabled={readonly || !noDisplayUnit} className={`${noDisplayUnit ? "" : "border-dark display-unit"} px-2 py-1`} color={noDisplayUnit ? (currentAttemptUnitsWrong ? "danger" : undefined) : "white"}>
                                    <Markup encoding={"latex"}>
                                        {wrapUnitForSelect(noDisplayUnit ? currentAttemptUnits : doc.displayUnit)}
                                    </Markup>
                                </DropdownToggle>
                                <DropdownMenu right>
                                    {selectedUnits.map((unit) =>
                                        <DropdownItem key={wrapUnitForSelect(unit)}
                                            data-unit={unit || 'None'}
                                            className={unit === currentAttemptUnits ? "btn bg-grey selected" : ""}
                                            onClick={(e: FormEvent) => {updateUnits(unit); e.preventDefault();}}>
                                            <Markup encoding={"latex"}>
                                                {wrapUnitForSelect(unit)}
                                            </Markup>
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
