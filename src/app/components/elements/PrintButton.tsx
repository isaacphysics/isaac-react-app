import React, {useState} from "react";
import {printingSettingsSlice, useAppDispatch} from "../../state";
import {Button} from "reactstrap";
import { IconButton } from "./AffixButton";
import { isAda, siteSpecific } from "../../services";
import classNames from "classnames";

interface PrintProps {
    questionPage?: boolean;
}

export const PrintButton = ({questionPage}: PrintProps ) => {

    const [questionPrintOpen, setQuestionPrintOpen] = useState(false);
    const dispatch = useAppDispatch();

    return questionPage ?
        <div className="position-relative">
            {questionPrintOpen && <div className={classNames("action-buttons-popup-container", {"not-mobile": isAda})}>
                <div className="question-actions-link text-nowrap">
                    <Button
                        size={"sm"}
                        color={"link"}
                        title={"Print with hints"}
                        className="a-alt"
                        onClick={() => {
                            dispatch(printingSettingsSlice.actions.enableHints(true));
                            setTimeout(window.print, 100);
                        }}
                    ><span className="visually-hidden">Print{" "}</span>With hints
                    </Button>
                    |
                    <Button
                        size={"sm"}
                        color={"link"}
                        title={"Print without hints"}
                        className="a-alt"
                        onClick={() => {
                            dispatch(printingSettingsSlice.actions.enableHints(false));
                            setTimeout(window.print, 100);
                        }}
                    ><span className="visually-hidden">Print{" "}</span>Without hints</Button>
                </div>
            </div>}
            {siteSpecific(
                <IconButton
                    icon="icon-print"
                    className="w-max-content h-max-content"
                    affixClassName="icon-color-black-hoverable"
                    aria-label="Print page" 
                    title="Print page"
                    color="tint"
                    data-bs-theme="neutral"
                    onClick={() => setQuestionPrintOpen(!questionPrintOpen)}
                />,
                <button
                    className="print-icon btn-action not-mobile"
                    onClick={() => setQuestionPrintOpen(!questionPrintOpen)}
                    aria-label="Print page"
                />
            )}
        </div>
        :
        siteSpecific(
            <IconButton
                icon="icon-print"
                className="w-max-content h-max-content"
                affixClassName="icon-color-black-hoverable"
                aria-label="Print page" 
                title="Print page"
                color="tint"
                data-bs-theme="neutral"
                onClick={() => {
                    dispatch(printingSettingsSlice.actions.enableHints(false));
                    setTimeout(window.print, 100);
                }}
            />,
            <button
                className="print-icon btn-action not-mobile"
                onClick={() => {
                    dispatch(printingSettingsSlice.actions.enableHints(false));
                    setTimeout(window.print, 100);
                }}
                aria-label="Print page"
            />
        );
};
