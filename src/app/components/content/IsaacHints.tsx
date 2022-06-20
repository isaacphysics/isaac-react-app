import {ListGroup, ListGroupItem} from "reactstrap";
import {IsaacHintModal} from "./IsaacHintModal";
import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import {useDispatch, useSelector} from "react-redux";
import {Tabs} from "../elements/Tabs";
import {logAction} from "../../state/actions";

const PrintOnlyHints = ({hints}: {hints?: ContentDTO[]}) => {
    const printHints = useSelector((state: AppState) => state?.printingSettings?.hintsEnabled);
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
    confidenceSessionUuid?: React.MutableRefObject<string>;
}
export const IsaacLinkHints = ({hints, questionPartId, confidenceSessionUuid}: HintsProps) => {
    return <div>
        <ListGroup className="question-hints mb-1 pt-3 mt-3 no-print">
            {hints?.map((hint, index) => <ListGroupItem key={index} className="pl-0 py-1">
                <IsaacHintModal questionPartId={questionPartId} hintIndex={index}
                                label={`Hint ${index + 1}`} title={hint.title || `Hint ${index + 1}`}
                                body={hint} scrollable confidenceSessionUuid={confidenceSessionUuid} />
            </ListGroupItem>)}
        </ListGroup>
        <PrintOnlyHints hints={hints} />
    </div>;
};

export const IsaacTabbedHints = ({hints, questionPartId}: HintsProps) => {
    const dispatch = useDispatch();

    function logHintView(viewedHintIndex: number) {
        if (viewedHintIndex > -1) {
            const eventDetails = {type: "VIEW_HINT", questionId: questionPartId, hintIndex: viewedHintIndex};
            dispatch(logAction(eventDetails));
        }
    }

    return <div className="tabbed-hints">
        {hints && <Tabs onActiveTabChange={logHintView} className="no-print" tabTitleClass="hint-tab-title" tabContentClass="mt-1" deselectable activeTabOverride={-1}>
            {Object.assign({}, ...hints.map((hint, index) => ({
                [`Hint\u00A0${index + 1}`]: <div className="mt-3 mt-lg-4 pt-2">
                    <IsaacContent doc={hint} />
                </div>
            })))}
        </Tabs>}
        <PrintOnlyHints hints={hints} />
    </div>
};
