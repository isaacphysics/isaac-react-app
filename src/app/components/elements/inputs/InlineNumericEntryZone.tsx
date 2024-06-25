import React, { FormEvent, useEffect, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from "reactstrap";
import classNames from "classnames";
import { Markup } from "../markup";
import { IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO } from "../../../../IsaacApiTypes";
import { selectors, useAppSelector, useGetConstantUnitsQuery } from "../../../state";
import { isLoggedIn, useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps, correctnessClass } from "../markup/portals/InlineEntryZone";
import { selectUnits, wrapUnitForSelect } from "../../../services/numericUnits";
import { QuestionCorrectness } from "../../../../IsaacAppTypes";

export const InlineNumericEntryZone = ({width, height, questionDTO, setModified, correctness, focusRef, ...rest} : InlineEntryZoneProps<IsaacNumericQuestionDTO>) => {

    const questionId = questionDTO?.id ?? "";
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<QuantityDTO>(questionId as string);

    const [value, setValue] = useState<string | undefined>(questionDTO?.bestAttempt?.answer?.value);
    const [unit, setUnit] = useState<string | undefined>(questionDTO.displayUnit ?? (questionDTO?.bestAttempt?.answer as QuantityDTO)?.units);

    const user = useAppSelector(selectors.user.orNull);
    const {data: units} = useGetConstantUnitsQuery();
    const selectedUnits = selectUnits(questionDTO, questionId, units, isLoggedIn(user) ? user.id : undefined);
    const [isOpen, setIsOpen] = useState(false);
    const noDisplayUnit = questionDTO.displayUnit == null || questionDTO.displayUnit === "";
    const readonly = false;

    const attempt = ((questionDTO?.validationResponse ?? questionDTO.bestAttempt) as QuantityValidationResponseDTO | undefined);

    const valueCorrectness = correctness === "NOT_SUBMITTED" ? "NOT_SUBMITTED" : 
        attempt?.correctValue ? "CORRECT" : 
        attempt?.correctValue === undefined ? "NOT_SUBMITTED" : // this fixes an edge case caused by the value not being marked (i.e. correctValue === undefined) if the units are not answered; we should not colour the value in this case
        (attempt?.answer as QuantityDTO).value ? "INCORRECT" : "NOT_ANSWERED";
    const unitCorrectness = correctness === "NOT_SUBMITTED" ? "NOT_SUBMITTED" :
        attempt?.correctUnits ? "CORRECT" :
        (attempt?.answer as QuantityDTO).units !== undefined ? "INCORRECT" : "NOT_ANSWERED";

    const showFeedback = (correctness : QuestionCorrectness) => {
        // whether the provided correctness requires a feedback icon to be shown
        return correctness === "INCORRECT" || correctness === "NOT_ANSWERED";
    };

    useEffect(function updateCurrentAttempt() {
        const attempt = {
            type: "quantity",
            value: value,
            units: unit,
        };
        dispatchSetCurrentAttempt(attempt);
        setModified(true);
    }, [value, unit, setModified]);

    return <div {...rest} 
        className={classNames("inline-numeric-container", rest.className, correctnessClass(valueCorrectness === "NOT_SUBMITTED" ? "NOT_SUBMITTED" : correctness))}
    >
        <div className={"feedback-zone inline-nq-feedback"}
            style={{
                ...(height && {height: `${height}px`}),
            }}
        >
            <Input 
                ref={focusRef}
                className={classNames(
                    "inline-input force-print h-100",
                    {"units-shown" : questionDTO.requireUnits || !noDisplayUnit}, 
                    // if the answer is incorrect because the units are wrong but the value is correct, hide the green outline from the value
                    correctnessClass((correctness === "INCORRECT" && valueCorrectness === "CORRECT") ? "NOT_SUBMITTED" : valueCorrectness)
                )}
                style={{
                    ...(width && {width: `${width}px`}), 
                }}
                value={value ?? ""}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
            />
            {showFeedback(valueCorrectness) && <div className={"feedback-box"}>
                {valueCorrectness === "NOT_ANSWERED" ? 
                    <span className={"feedback unanswered"}><b>!</b></span> : 
                    <span className={"feedback incorrect"}>✘</span>
                }
            </div>}
        </div>

        {(questionDTO.requireUnits || !noDisplayUnit) && <Dropdown 
                disabled={readonly} 
                isOpen={isOpen && noDisplayUnit} 
                toggle={() => {setIsOpen(!isOpen);}} 
                className={classNames("inline-unit-dropdown justify-content-center", {"display-unit": !noDisplayUnit})}
                style={{
                    ...(height && {height: `${height}px`}),
                }}
        >
            <DropdownToggle
                disabled={readonly || !noDisplayUnit}
                className={classNames("feedback-zone pl-2 pr-0 py-0", {"pr-4": showFeedback(unitCorrectness), "border-dark": !noDisplayUnit})}
                color={noDisplayUnit ? undefined : "white"}
            >
                <div className={showFeedback(unitCorrectness) ? "pr-4" : "pr-2"}>
                    <Markup encoding={"latex"}>
                        {unit !== undefined ? wrapUnitForSelect(noDisplayUnit ? unit : questionDTO.displayUnit) : "Unit..."}
                    </Markup>
                    {showFeedback(unitCorrectness) && noDisplayUnit && <div className={"feedback-box pl-2"}>
                        {unitCorrectness === "NOT_ANSWERED" ? 
                            <span className={"feedback unanswered px-1"}><b>!</b></span> : 
                            <span className={"feedback incorrect"}>✘</span>
                        }
                    </div>}
                </div>
            </DropdownToggle>
            <DropdownMenu right>
                {selectedUnits.map((unit) =>
                    <DropdownItem key={wrapUnitForSelect(unit)}
                        data-unit={unit || 'None'}
                        className={unit && unit === currentAttempt?.units ? "btn bg-grey selected" : ""}
                        onClick={(e: FormEvent) => {setUnit(unit); e.preventDefault();}}
                    >
                        <Markup encoding={"latex"}>
                            {wrapUnitForSelect(unit)}
                        </Markup>
                    </DropdownItem>
                )}
            </DropdownMenu>
        </Dropdown>}
    </div>;

};