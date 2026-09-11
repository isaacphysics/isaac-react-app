import {Button, Col, Row} from "reactstrap";
import React, {useContext, useEffect, useState} from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {ConfidenceContext} from "../../../IsaacAppTypes";
import {IsaacContent} from "./IsaacContent";
import {AppState, useAppDispatch, useAppSelector, logAction, openActiveModal, closeActiveModal} from "../../state";
import {Tabs} from "../elements/Tabs";

interface HintsProps {
    hints?: ContentDTO[];
    questionPartId: string;
    style: "tabbed" | "modal";
    includePreamble?: boolean;
}

export const IsaacHints = ({hints, questionPartId, style, includePreamble}: HintsProps) => {
    const dispatch = useAppDispatch();
    const {recordConfidence} = useContext(ConfidenceContext);
    const printHints = useAppSelector((state: AppState) => state?.printingSettings?.hintsEnabled);

    async function logHintView(viewedHintIndex: number) {
        if (viewedHintIndex > -1) {
            if (recordConfidence) {
                await dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_HINT",
                    questionPartId,
                    hintIndex: viewedHintIndex
                }));
            }
            await dispatch(logAction({
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
                newTitles[index] = hint.title || `Hint\u00A0${currHintIndex}`;
                currHintIndex += hint.title ? 0 : 1;
                index += 1;
            }
            setTitles(newTitles);
        }
    }, [hints]);

    return hints && !!hints.length && <>
        {includePreamble && <small className="no-print mb-0">{"Don't forget to use the hints if you need help."}</small>}
        {style === "tabbed" && <div className="tabbed-hints no-print">
            <div className="text-theme mb-2 h5">Need some help?</div>
            <Tabs onActiveTabChange={logHintView} className="no-print" style="dropdowns" tabTitleClass="hint-tab-title" tabContentClass="mt-1" deselectable activeTabOverride={-1}>
                {Object.assign({}, ...hints.map((hint, index) => ({
                    [titles[index]]: <div className="mt-3 mt-lg-4 pt-2">
                        <IsaacContent doc={hint} />
                    </div>
                })))}
            </Tabs>
        </div>}
        {style === "modal" && <Row className="question-hints mt-2 mb-3 no-print justify-content-xs-center justify-content-lg-start">
            {hints?.map((hint, index) =>
                <Col key={index} xs={3} lg={2}>
                    <Button color="link" size="sm" onClick={async () => {
                        dispatch(openActiveModal(({
                            closeAction: () => dispatch(closeActiveModal()),
                            title: titles[index],
                            body: <IsaacContent doc={hint} />,
                            size: "lg",
                        })));
                        await logHintView(index);
                    }}>
                        {titles[index]}
                    </Button>
                </Col>
            )}
        </Row>}
        {printHints && hints?.map((hint, index) => (
            <div key={index} className={"question-hints ps-0 py-1 only-print"}>
                <div className="h4">{titles[index]}</div>
                <IsaacContent doc={hint}/>
            </div>
        ))}
    </>;
};
