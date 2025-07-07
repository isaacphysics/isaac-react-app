import React, { useState } from "react";
import { ChoiceQuestionDTO, IsaacMultiChoiceQuestionDTO } from "../../../../IsaacApiTypes";
import { InlineEntryZoneProps, correctnessClass } from "../markup/portals/InlineEntryZone";
import classNames from "classnames";
import { DropdownItem, Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import { useCurrentQuestionAttempt } from "../../../services";
import { Markup } from "../markup";

export const InlineMultiChoiceEntryZone = ({questionDTO, focusRef, setModified, correctness, contentClasses, contentStyle, ...rest} : InlineEntryZoneProps<IsaacMultiChoiceQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ChoiceQuestionDTO>(questionDTO.id as string);
    const [isOpen, setIsOpen] = useState(false);
    
    function updateCurrentAttempt({newValue} : {newValue?: string}) {
        const attempt = {
            type: "stringChoice",
            value: newValue,
        };
        dispatchSetCurrentAttempt(attempt);
        setModified(true);
    }
    
    return <div {...rest} className={classNames("inline-multi-choice-container w-100 h-100", rest.className)}>
        <Dropdown
            isOpen={isOpen}
            toggle={() => {setIsOpen(!isOpen);}}
            className={classNames("d-flex feedback-wrapper", contentClasses)}
            style={contentStyle}
        >
            <DropdownToggle innerRef={focusRef} className={classNames("w-100 h-100 d-flex ps-2 pe-4 p-0", correctnessClass(correctness))} color="white">
                <span aria-hidden>
                    <Markup trusted-markup-encoding={"html"}>
                        {currentAttempt?.value ?? ""}
                    </Markup>
                </span>
                <i className={classNames("icon icon-chevron-right icon-dropdown-90 ms-auto", {"active": isOpen})} aria-hidden="true"/>
            </DropdownToggle>
            <DropdownMenu container={focusRef.current?.closest(".question-content") as HTMLElement || "body"} end> 
                {/* Dummy option added to clear selection */}
                <DropdownItem
                    data-unit={'None'}
                    onClick={() => {updateCurrentAttempt({newValue: undefined});}}
                >
                    <span className="fst-italic text-muted">(clear)</span>
                </DropdownItem>
                {questionDTO.choices?.map((item, i) => {
                    return <DropdownItem key={i}
                        data-unit={item}
                        onClick={() => {updateCurrentAttempt({newValue: item.value});}}
                    >
                        <Markup trusted-markup-encoding={"html"}>
                            {item.value ?? ""}
                        </Markup>
                    </DropdownItem>;
                })}
            </DropdownMenu>
        </Dropdown>
    </div>;
};
