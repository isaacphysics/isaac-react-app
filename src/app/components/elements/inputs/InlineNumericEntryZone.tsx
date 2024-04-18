import React, { FormEvent, useEffect, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from "reactstrap";
import classNames from "classnames";
import { Markup } from "../markup";
import { IsaacNumericQuestionDTO, QuantityDTO, QuantityValidationResponseDTO } from "../../../../IsaacApiTypes";
import { selectors, useAppSelector, useGetConstantUnitsQuery } from "../../../state";
import { isLoggedIn, useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps } from "../markup/portals/InlineEntryZone";
import { selectUnits, wrapUnitForSelect } from "../../../services/numericUnits";

export const InlineNumericEntryZone = ({width, height, questionDTO, setModified, valid, invalid, focusRef, ...rest} : InlineEntryZoneProps<IsaacNumericQuestionDTO>) => {

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

    const currentAttemptValueWrong = ((questionDTO?.validationResponse ?? questionDTO.bestAttempt) as QuantityValidationResponseDTO | undefined)?.correctValue === false;
    const currentAttemptUnitsWrong = ((questionDTO?.validationResponse ?? questionDTO.bestAttempt) as QuantityValidationResponseDTO | undefined)?.correctUnits === false;
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

    return <div {...rest} className={`d-inline-flex inline-numeric-container ${rest.className} ${classNames({"is-valid": valid, "is-invalid": invalid})}`}>
        <div className={"feedback-zone inline-nq-feedback"}>
            <Input 
                ref={focusRef}
                valid={valid}
                invalid={invalid && currentAttemptValueWrong}
                className={classNames({"units-shown" : questionDTO.requireUnits || !noDisplayUnit})}
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
                <span className={"feedback incorrect"}><b>!</b></span>
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