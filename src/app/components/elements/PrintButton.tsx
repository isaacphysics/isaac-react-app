import {setPrintingHints} from "../../state/actions";
import React, {useState} from "react";
import {useAppDispatch} from "../../state/store";

interface PrintProps {
    questionPage?: boolean;
}

export const PrintButton = ({questionPage}: PrintProps ) => {

    const [questionPrintOpen, setQuestionPrintOpen] = useState(false);
    const dispatch = useAppDispatch();

    return questionPage ?
        <React.Fragment>
            <button
                className="print-icon btn-action"
                onClick={() => setQuestionPrintOpen(!questionPrintOpen)}
                aria-label="Print page"
            />
            {
                questionPrintOpen && <div className="question-actions-link-box">
                    <div className="question-actions-link">
                        <button
                            className="a-alt btn btn-link btn-sm"
                            onClick={() => {
                                dispatch(setPrintingHints(true));
                                setTimeout(window.print, 100);
                            }}
                        ><span className="sr-only">Print </span>With hints
                        </button>
                        |
                        <button
                            className="a-alt btn btn-link btn-sm"
                            onClick={() => {
                                dispatch(setPrintingHints(false));
                                setTimeout(window.print, 100);
                            }}
                        ><span className="sr-only">Print </span>Without hints</button>
                    </div>
                </div>
            }
        </React.Fragment>
        :
        <React.Fragment>
            <button
                className="print-icon btn-action"
                onClick={() => {
                    dispatch(setPrintingHints(false));
                    setTimeout(window.print, 100);
                }}
                aria-label="Print page"
            />
        </React.Fragment>
};
