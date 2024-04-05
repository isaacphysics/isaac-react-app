import {Col, Row} from "reactstrap";
import {IsaacHintModal} from "./IsaacHintModal";
import React, {useContext, useEffect, useState} from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {ConfidenceContext} from "../../../IsaacAppTypes";
import {IsaacContent} from "./IsaacContent";
import {AppState, useAppDispatch, useAppSelector, logAction} from "../../state";
import {Tabs} from "../elements/Tabs";

const PrintOnlyHints = ({hints}: {hints?: ContentDTO[]}) => {
    const printHints = useAppSelector((state: AppState) => state?.printingSettings?.hintsEnabled);
    return <React.Fragment>
        {printHints && hints?.map((hint, index) => (
            <div key={index} className={"question-hints pl-0 py-1 only-print"}>
                <h4>{`Hint ${index + 1}`}</h4>
                <IsaacContent doc={hint}/>
            </div>
        ))}
    </React.Fragment>;
};

interface HintsProps {
    hints?: ContentDTO[];
    questionPartId: string;
}
export const IsaacLinkHints = ({hints, questionPartId}: HintsProps) => {
    return <div>
        <Row className="question-hints mt-2 mb-3 no-print justify-content-xs-center justify-content-lg-start">
            {
                hints?.map((hint, index) =>
                    <Col key={index} xs={{size: 3}} lg={{size: 2}}>
                            <IsaacHintModal questionPartId={questionPartId} hintIndex={index}
                                        label={`Hint ${index + 1}`} title={hint.title || `Hint ${index + 1}`}
                                        body={hint} scrollable />
                    </Col>
                )
            }
        </Row>
        <PrintOnlyHints hints={hints} />
    </div>;
};

export const IsaacTabbedHints = ({hints, questionPartId}: HintsProps) => {
    const dispatch = useAppDispatch();
    const {recordConfidence} = useContext(ConfidenceContext);

    function logHintView(viewedHintIndex: number) {
        if (viewedHintIndex > -1) {
            if (recordConfidence) {
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_HINT",
                    questionPartId,
                    hintIndex: viewedHintIndex
                }));
            }
            dispatch(logAction({
                type: "VIEW_HINT",
                questionId: questionPartId,
                hintIndex: viewedHintIndex
            }));
        }
    }

    // Give indexed titles to untitled hints
    const [titles, setTitles] = useState<string[]>([]);
    useEffect(() => {
        if (hints) {
            const newTitles: string[] = [];
            let currHintIndex = 1;
            let index = 0;
            for (const hint of hints) {
                newTitles[index] = hint.title ?? `Hint\u00A0${currHintIndex}`;
                currHintIndex += hint.title ? 0 : 1;
                index += 1;
            }
            setTitles(newTitles);
        }
    }, [hints]);

    return <div className="tabbed-hints">
        {hints && <Tabs onActiveTabChange={logHintView} className="no-print" tabTitleClass="hint-tab-title" tabContentClass="mt-1" deselectable activeTabOverride={-1}>
            {Object.assign({}, ...hints.map((hint, index) => ({
                [titles[index]]: <div className="mt-3 mt-lg-4 pt-2">
                    <IsaacContent doc={hint} />
                </div>
            })))}
        </Tabs>}
        <PrintOnlyHints hints={hints} />
    </div>;
};
