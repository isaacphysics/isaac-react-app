import React, { FormEvent, useEffect, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from "reactstrap";
import classNames from "classnames";
import { Markup } from "../markup";
import { IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO } from "../../../../IsaacApiTypes";
import { selectors, useAppSelector, useGetConstantUnitsQuery } from "../../../state";
import { isLoggedIn, useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps, correctnessClass } from "../markup/portals/InlineEntryZone";
import { selectUnits, wrapUnitForSelect } from "../../../services/numericUnits";

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

    const currentAttemptValueWrong = correctness !== "NOT_SUBMITTED" && ((questionDTO?.validationResponse ?? questionDTO.bestAttempt) as QuantityValidationResponseDTO | undefined)?.correctValue === false;
    const currentAttemptUnitsWrong = correctness !== "NOT_SUBMITTED" && ((questionDTO?.validationResponse ?? questionDTO.bestAttempt) as QuantityValidationResponseDTO | undefined)?.correctUnits === false;
    const feedbackShowing = false;

    useEffect(function updateCurrentAttempt() {
        const attempt = {
            type: "quantity",
            value: value,
            units: unit,
        };
        dispatchSetCurrentAttempt(attempt);
        setModified(true);
    }, [value, unit, setModified]);

    return <div {...rest} className={classNames("d-inline-flex inline-numeric-container", rest.className, correctnessClass(correctness))}>
        <div className={"feedback-zone inline-nq-feedback"}>
            <Input 
                ref={focusRef}
                className={classNames(
                    {"units-shown" : questionDTO.requireUnits || !noDisplayUnit}, 
                    // if the value is correct but the unit is not, only the unit should be marked as such
                    correctnessClass(correctness === "INCORRECT" ? (currentAttemptValueWrong ? "INCORRECT" : "NOT_SUBMITTED") : correctness)
                )}
                style={{
                    ...(width && {width: `${width}px`}), 
                    ...(height && {height: `${height}px`}),
                }}
                value={value ?? ""}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
            />
            {currentAttemptValueWrong && <div className={"feedback-box"}>
                {correctness === "NOT_ANSWERED" ? 
                    <span className={"feedback unanswered"}><b>!</b></span> : 
                    <span className={"feedback incorrect"}>✘</span>
                }
            </div>}
        </div>

        {(questionDTO.requireUnits || !noDisplayUnit) && <Dropdown disabled={readonly} isOpen={isOpen && noDisplayUnit} toggle={() => {setIsOpen(!isOpen);}} className={classNames("inline-unit-dropdown d-flex justify-content-center", {"display-unit": !noDisplayUnit})}>
            <DropdownToggle
                disabled={readonly || !noDisplayUnit}
                className={classNames("feedback-zone pl-2 pr-0 py-0", {"pr-4": currentAttemptUnitsWrong, "border-dark": !noDisplayUnit, "feedback-showing": feedbackShowing})}
                color={noDisplayUnit ? undefined : "white"}
            >
                <div className={currentAttemptUnitsWrong ? "pr-4" : "pr-2"}>
                    <Markup encoding={"latex"}>
                        {wrapUnitForSelect(noDisplayUnit ? unit : questionDTO.displayUnit)}
                    </Markup>
                    {currentAttemptUnitsWrong && noDisplayUnit && <div className="feedback-box pl-2">
                        <span className={"feedback incorrect"}>✘</span>
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