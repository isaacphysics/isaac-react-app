import React, { FormEvent, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from "reactstrap";
import classNames from "classnames";
import { Markup } from "../markup";
import { IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO } from "../../../../IsaacApiTypes";
import { selectors, useAppSelector, useGetConstantUnitsQuery } from "../../../state";
import { isDefined, isLoggedIn, useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps, correctnessClass } from "../markup/portals/InlineEntryZone";
import { selectUnits, wrapUnitForSelect } from "../../../services/numericUnits";
import { QuestionCorrectness } from "../../../../IsaacAppTypes";

export const InlineNumericEntryZone = ({width, height, questionDTO, setModified, correctness, focusRef, ...rest} : InlineEntryZoneProps<IsaacNumericQuestionDTO>) => {

    const questionId = questionDTO?.id ?? "";
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<QuantityDTO>(questionId as string);

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

    function updateCurrentAttempt({newValue, newUnits} : {newValue?: string, newUnits?: string}) {
        const attempt = {
            type: "quantity",
            value: newValue ?? currentAttempt?.value,
            units: newUnits ?? currentAttempt?.units,
        };
        dispatchSetCurrentAttempt(attempt);
        setModified(true);
    }

    const unit = questionDTO.displayUnit ?? currentAttempt?.units;

    return <div {...rest} 
        className={classNames("inline-numeric-container w-100", rest.className, correctnessClass(valueCorrectness === "NOT_SUBMITTED" ? "NOT_SUBMITTED" : correctness))}
    >
        <div className={"feedback-zone inline-nq-feedback w-100"}
            style={{
                ...(height && {height: `${height}px`}),
            }}
        >
            <Input 
                ref={focusRef}
                className={classNames(
                    "force-print h-100",
                    {"units-shown" : questionDTO.requireUnits || !noDisplayUnit},
                    // if the answer is incorrect because the units are wrong but the value is correct, hide the green outline from the value
                    correctnessClass((correctness === "INCORRECT" && valueCorrectness === "CORRECT") ? "NOT_SUBMITTED" : valueCorrectness)
                )}
                style={{
                    ...(width && {width: `${width}px`}), 
                }}
                value={currentAttempt?.value ?? ""}
                onChange={(e) => {
                    updateCurrentAttempt({newValue: e.target.value});
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
                className={classNames("feedback-zone ps-2 pe-0 py-0", {"pe-4": showFeedback(unitCorrectness) && noDisplayUnit, "border-dark": !noDisplayUnit})}
                color={noDisplayUnit ? undefined : "white"}
            >
                <div className={showFeedback(unitCorrectness) && noDisplayUnit ? "pe-4" : "pe-2"}>
                    <Markup encoding={"latex"}>
                        {isDefined(unit) ? wrapUnitForSelect(unit) : "Unit..."}
                    </Markup>
                    {showFeedback(unitCorrectness) && noDisplayUnit && <div className={"feedback-box ps-2"}>
                        {unitCorrectness === "NOT_ANSWERED" ? 
                            <span className={"feedback unanswered px-1"}><b>!</b></span> : 
                            <span className={"feedback incorrect"}>✘</span>
                        }
                    </div>}
                </div>
            </DropdownToggle>
            <DropdownMenu end>
                {selectedUnits.map((unit) =>
                    <DropdownItem key={wrapUnitForSelect(unit)}
                        data-unit={isDefined(unit) ? (unit || 'None') : undefined}
                        className={unit && unit === currentAttempt?.units ? "btn bg-grey selected" : ""}
                        onClick={(e: FormEvent) => {updateCurrentAttempt({newUnits: unit}); e.preventDefault();}}
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
