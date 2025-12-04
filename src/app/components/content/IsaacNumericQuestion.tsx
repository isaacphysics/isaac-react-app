import React, {FormEvent, useRef, useState} from "react";
import {AppState, useAppSelector, useGetConstantUnitsQuery} from "../../state";
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
    Row,
    UncontrolledTooltip
} from "reactstrap";
import {above, below, isAda, isPhy, siteSpecific, useCurrentQuestionAttempt, useDeviceSize} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import classNames from "classnames";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import {selectUnits, wrapUnitForSelect} from "../../services/numericUnits";

export const numericInputValidator = (input: string) => {
    const regexStr = "[^ 0-9EXex(){},.+*/\\^×÷-]";
    const badCharacters = new RegExp(regexStr, "g");
    const operatorExpression = new RegExp(".*[0-9][+/÷-]\\.?[0-9]+");
    const missingExponentSymbol = new RegExp(".*?10-([0-9]+).*?");
    const errors = [];

    const usedBadChars = [...input.matchAll(badCharacters)];
    const uniqueBadChars = [...new Set(usedBadChars.map(match => match[0] === ' ' ? 'space' : match[0]))].join(" ");
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
    } else {
        if (/ /.test(input.trim())) {
            errors.push('Do not use spaces when entering your answer.');
        }
        if (/\d,\d|^,\d/.test(input.trim())) {
            errors.push('Use points instead of commas as decimal separators.');
        }
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

    const deviceSize = useDeviceSize();

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

    const helpTooltip = useRef(null);

    const tooltip = <UncontrolledTooltip placement="auto" autohide target={helpTooltip}>
        Here are some examples of numbers you can write:<br /><br />
        3.7<br />
        -3x10^14<br />
        2.8e-12<br /><br />
        Do not use commas or spaces.
    </UncontrolledTooltip>;

    const noDisplayUnit = doc.displayUnit == null || doc.displayUnit === "";

    return (
        <div className="numeric-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            <Row className="no-print">
                <Col xs={12} className="d-flex flex-column flex-md-row">
                    <div className="d-flex flex-column numeric-value w-100 w-md-50 mb-2">
                        Value
                        <InputGroup className={"feedback-zone nq-feedback separate-input-group flex-grow-1 align-items-center"}>
                            <Input type="text" value={currentAttemptValue || ""} invalid={currentAttemptValueWrong}
                                onChange={e => {
                                    updateValue(e);
                                }} readOnly={readonly}
                            />
                            {currentAttemptValueWrong && <div className={"feedback-box"}>
                                <span className={"feedback incorrect"}><b>!</b></span>
                            </div>}
                            {!readonly && isAda && <i ref={helpTooltip} className="icon icon-info icon-sm h-100 ms-3" />}
                            {!readonly && isPhy && !above['md'](deviceSize) && <Button type="button" className="numeric-help" size="sm" innerRef={helpTooltip}>?</Button>}
                            {!readonly && !(isPhy && above['md'](deviceSize)) && tooltip}
                        </InputGroup>
                    </div>
                    {(doc.requireUnits || doc.displayUnit) && <div className="d-flex flex-column unit-selection ps-md-7 w-100 w-md-50 mb-2">
                        Unit{noDisplayUnit && "s"}
                        <Dropdown className="flex-grow-1" disabled={readonly} isOpen={isOpen && noDisplayUnit} toggle={() => {setIsOpen(!isOpen);}}>
                            <DropdownToggle
                                disabled={readonly || !noDisplayUnit}
                                className={classNames("feedback-zone w-md-auto h-100 px-2 py-1", {"border-dark display-unit": !noDisplayUnit, "feedback-showing": currentAttemptUnitsWrong && noDisplayUnit, "bg-white": isPhy, "my-2": isPhy && below['sm'](deviceSize)})}
                                color={noDisplayUnit ? siteSpecific("dropdown", undefined) : "white"}
                                caret={isPhy && noDisplayUnit}
                            >
                                <Markup encoding={"latex"}>
                                    {wrapUnitForSelect(noDisplayUnit ? currentAttemptUnits : doc.displayUnit)}
                                </Markup>
                                {isAda && currentAttemptUnitsWrong && noDisplayUnit && <div className={"feedback-box"}>
                                    <span className={"feedback incorrect"}>✘</span>
                                </div>}
                            </DropdownToggle>
                            <DropdownMenu end className="w-100 w-md-50">
                                {selectedUnits.map((unit) =>
                                    <DropdownItem key={wrapUnitForSelect(unit)}
                                        data-unit={unit || 'None'}
                                        className={classNames({"bg-inline-question selected": unit === currentAttemptUnits})}
                                        onClick={(e: FormEvent) => {updateUnits(unit); e.preventDefault();}}>
                                        {/* Buttons cannot contain semantic children in the accessibility tree;
                                                so we must use alt text here! */}
                                        <Markup encoding={"latex"} forceMathsAltText={true}>
                                            {wrapUnitForSelect(unit)}
                                        </Markup>
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    </div>}
                </Col>
                {!readonly && isPhy && above['md'](deviceSize) && <Col xs={12}>
                    <Button className="numeric-help d-flex align-items-center m-0 p-0 pe-2 gap-2 text-muted small" type="button" color="link" size="sm" innerRef={helpTooltip}>
                        <i className="icon icon-info icon-color-grey"/>
                        What can I type in this box?
                    </Button>
                    {tooltip}
                </Col>}
            </Row>
            <QuestionInputValidation userInput={currentAttemptValue ?? ""} validator={numericInputValidator} />
        </div>
    );
};
export default IsaacNumericQuestion;
