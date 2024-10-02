import React, {FormEvent, useMemo, useState} from "react";
import {AppState, useAppSelector, useGetConstantUnitsQuery} from "../../state";
import Rand from 'rand-seed';
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
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
    Label,
    Row,
    UncontrolledTooltip
} from "reactstrap";
import {isAda, siteSpecific, useCurrentQuestionAttempt} from "../../services";
import {v4 as uuid_v4} from 'uuid';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import classNames from "classnames";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import { selectUnits, wrapUnitForSelect } from "../../services/numericUnits";

export const numericInputValidator = (input: string) => {
    const regexStr = "[^ 0-9EXex(){},.+*/\\^×÷-]+";
    const badCharacters = new RegExp(regexStr, "g");
    const operatorExpression = new RegExp(".*[0-9][+/÷-]\\.?[0-9]+");
    const missingExponentSymbol = new RegExp(".*?10-([0-9]+).*?");
    const errors = [];

    const usedBadChars =  [...input.matchAll(badCharacters)];
    const uniqueBadChars = [...new Set([...usedBadChars.toString()])].filter(e => e !== ",").join(" ");
    if (usedBadChars.length > 0) {
        errors.push('Some of the characters you are using are not allowed: ' + uniqueBadChars);
    }

    if (missingExponentSymbol.test(input)) {
        errors.push('Use a correct exponent symbol, e.g. 10^-3 or 10**-3.');
    } else if (operatorExpression.test(input)) {
        errors.push('Simplify your answer into a single decimal number.');
    }
    if (/.*?[0-9][, ][0-9]{3}.*?/.test(input)) {
        errors.push('Do not use commas or spaces as thousand separators when entering your answer.');
    }
    return errors;
};

const IsaacNumericQuestion = ({doc, questionId, validationResponse, readonly}: IsaacQuestionProps<IsaacNumericQuestionDTO, QuantityValidationResponseDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<QuantityDTO>(questionId);

    const currentAttemptValue = currentAttempt?.value;
    const currentAttemptUnits = currentAttempt?.units;
    const currentAttemptValueWrong = validationResponse && validationResponse.correctValue === false;
    const currentAttemptUnitsWrong = validationResponse && validationResponse.correctUnits === false;

    const userId = useAppSelector((state: AppState) => (state?.user?.loggedIn && state.user.id) || undefined);
    const {data: units} = useGetConstantUnitsQuery();

    const selectedUnits = selectUnits(doc, questionId, units, userId);

    function updateValue(event: FormEvent<HTMLInputElement>) {
        const attempt = {
            type: "quantity",
            value: event.currentTarget.value,
            units: currentAttemptUnits
        };
        dispatchSetCurrentAttempt(attempt);
    }

    function updateUnits(units?: string) {
        const attempt = {
            type: "quantity",
            value: currentAttemptValue,
            units: units
        };
        dispatchSetCurrentAttempt(attempt);
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
                <Col className="d-flex flex-column flex-md-row">
                    <div className="numeric-value w-100 w-md-50">
                        <Label className="w-100">
                            Value <br />
                            <InputGroup className={"feedback-zone nq-feedback separate-input-group"}>
                                <Input type="text" value={currentAttemptValue || ""} invalid={currentAttemptValueWrong}
                                    onChange={e => {
                                        updateValue(e);
                                    }} readOnly={readonly}
                                />
                                {currentAttemptValueWrong && <div className={"feedback-box"}>
                                    <span className={"feedback incorrect"}><b>!</b></span>
                                </div>}
                                {!readonly && <>
                                    {siteSpecific(
                                        <Button type="button" className={classNames("numeric-help", {"py-0": isAda})} size="sm" id={helpTooltipId}>?</Button>,
                                        <span id={helpTooltipId} className="icon-help-q my-auto ms-3"/>
                                    )}
                                    <UncontrolledTooltip placement="top" autohide={false} target={helpTooltipId}>
                                        Here are some examples of numbers you can write:<br /><br />
                                        3.7<br />
                                        -3x10^14<br />
                                        2.8e-12<br /><br />
                                        Do not use commas or spaces.
                                    </UncontrolledTooltip>
                                </>}
                            </InputGroup>
                        </Label>
                    </div>
                    {(doc.requireUnits || doc.displayUnit) && <div className="unit-selection w-100 w-md-50">
                        <Label className="w-100 w-md-auto ps-md-5">
                            Unit{noDisplayUnit && "s"} <br/>
                            <Dropdown disabled={readonly} isOpen={isOpen && noDisplayUnit} toggle={() => {setIsOpen(!isOpen);}}>
                                <DropdownToggle
                                    disabled={readonly || !noDisplayUnit}
                                    className={classNames("feedback-zone px-2 py-1", {"border-dark display-unit": !noDisplayUnit, "feedback-showing": currentAttemptUnitsWrong && noDisplayUnit})}
                                    color={noDisplayUnit ? undefined : "white"}
                                >
                                    <Markup encoding={"latex"}>
                                        {wrapUnitForSelect(noDisplayUnit ? currentAttemptUnits : doc.displayUnit)}
                                    </Markup>
                                    {currentAttemptUnitsWrong && noDisplayUnit && <div className={"feedback-box"}>
                                        <span className={"feedback incorrect"}>✘</span>
                                    </div>}
                                </DropdownToggle>
                                <DropdownMenu end>
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
            <QuestionInputValidation userInput={currentAttemptValue ?? ""} validator={numericInputValidator} />
        </div>
    );
};
export default IsaacNumericQuestion;