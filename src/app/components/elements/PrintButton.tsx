import React, {useState} from "react";
import {printingSettingsSlice, useAppDispatch} from "../../state";
import {Button} from "reactstrap";

interface PrintProps {
    questionPage?: boolean;
}

export const PrintButton = ({questionPage}: PrintProps ) => {

    const [questionPrintOpen, setQuestionPrintOpen] = useState(false);
    const dispatch = useAppDispatch();

    return questionPage ?
        <>
            <button
                className="print-icon btn-action"
                onClick={() => setQuestionPrintOpen(!questionPrintOpen)}
                aria-label="Print page"
            />
            {questionPrintOpen && <div className="question-actions-link-box">
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
                    ><span className="sr-only">Print{" "}</span>With hints
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
                    ><span className="sr-only">Print{" "}</span>Without hints</Button>
                </div>
            </div>}
        </>
        :
        <button
            className="print-icon btn-action"
            onClick={() => {
                dispatch(printingSettingsSlice.actions.enableHints(false));
                setTimeout(window.print, 100);
            }}
            aria-label="Print page"
        />
};
