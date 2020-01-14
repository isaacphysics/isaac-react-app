import {setPrintingHints} from "../../state/actions";
import React, {useState} from "react";
import {useDispatch} from "react-redux";


export const PrintButton = () => {

    const [questionPrintOpen, setQuestionPrintOpen] = useState(false);
    const dispatch = useDispatch();

    return<React.Fragment>
        <button
            className="ru_print"
            onClick={() => setQuestionPrintOpen(!questionPrintOpen)}/>
        {
            questionPrintOpen && <div className="question-actions-link-box">
                <div className="question-actions-link">
                    <button
                        className="a-alt btn btn-link btn-sm"
                        onClick={() => {
                            dispatch(setPrintingHints(true));
                            setTimeout(window.print, 100);
                        }}
                    >With hints
                    </button>
                    /
                    <button
                        className="a-alt btn btn-link btn-sm"
                        onClick={() => {
                            dispatch(setPrintingHints(false));
                            setTimeout(window.print, 100);
                        }}
                    >Without hints</button>
                </div>
            </div>
        }
    </React.Fragment>
};
