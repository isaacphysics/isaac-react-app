import React, { FormEvent, useRef, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from "reactstrap";
import classNames from "classnames";
import { Markup } from "../markup";
import { IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO } from "../../../../IsaacApiTypes";
import { selectors, useAppSelector, useGetConstantUnitsQuery } from "../../../state";
import { isDefined, isLoggedIn, useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps, correctnessClass } from "../markup/portals/InlineEntryZone";
import { selectUnits, wrapUnitForSelect } from "../../../services/numericUnits";
import { QuestionCorrectness } from "../../../../IsaacAppTypes";

export const InlineNumericEntryZone = ({questionDTO, setModified, correctness, focusRef, contentClasses, contentStyle, ...rest} : InlineEntryZoneProps<IsaacNumericQuestionDTO>) => {

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
        (attempt?.answer as QuantityDTO | undefined)?.value ? "INCORRECT" : "NOT_ANSWERED";
    const unitCorrectness = correctness === "NOT_SUBMITTED" ? "NOT_SUBMITTED" :
        attempt?.correctUnits ? "CORRECT" :
        (attempt?.answer as QuantityDTO | undefined)?.units !== undefined ? "INCORRECT" : "NOT_ANSWERED";

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

    const entryZoneRef = useRef<HTMLDivElement>(null);

    return <div {...rest} ref={entryZoneRef}
        className={classNames("inline-numeric-container", rest.className)}
    >
        <div className="feedback-wrapper flex-grow-1">
            <Input 
                ref={focusRef}
                className={classNames(
                    contentClasses,
                    "force-print",
                    {"units-shown" : questionDTO.requireUnits || !noDisplayUnit},
                    // if the answer is incorrect because the units are wrong but the value is correct, hide the green outline from the value
                    correctnessClass((correctness === "INCORRECT" && valueCorrectness === "CORRECT") ? "NOT_SUBMITTED" : valueCorrectness)
                )}
                style={contentStyle}
                value={currentAttempt?.value ?? ""}
                onChange={(e) => {
                    updateCurrentAttempt({newValue: e.target.value});
                }}
            />
        </div>

        {(questionDTO.requireUnits || !noDisplayUnit) && <Dropdown 
            disabled={readonly} 
            isOpen={isOpen && noDisplayUnit} 
            toggle={() => {setIsOpen(!isOpen);}} 
            className={classNames("inline-unit-dropdown justify-content-center", {"display-unit": !noDisplayUnit})}
        >   
            <DropdownToggle
                disabled={readonly || !noDisplayUnit}
                className={classNames(
                    "feedback-wrapper px-2 py-0", 
                    {"border-dark": !noDisplayUnit}
                )}
                color={noDisplayUnit ? undefined : "white"}
            >
                <div className={classNames({[correctnessClass((correctness === "INCORRECT" && unitCorrectness === "CORRECT") ? "NOT_SUBMITTED" : unitCorrectness)] : showFeedback(unitCorrectness) && noDisplayUnit})}>
                    <Markup encoding={"latex"}>
                        {isDefined(unit) ? wrapUnitForSelect(unit) : "Unit..."}
                    </Markup>
                </div>
            </DropdownToggle>
            <DropdownMenu container={entryZoneRef.current?.closest(".question-content") as HTMLElement || "body"} end>
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
