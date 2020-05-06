import {ListGroup, ListGroupItem} from "reactstrap";
import {IsaacHintModal} from "./IsaacHintModal";
import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import {useSelector} from "react-redux";
import {Tabs} from "../elements/Tabs";

const PintOnlyHints = ({hints}: {hints?: ContentDTO[]}) => {
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
}
export const IsaacLinkHints = ({hints, questionPartId}: HintsProps) => {
    return <div>
        <ListGroup className="question-hints mb-1 pt-3 mt-3 no-print">
            {hints?.map((hint, index) => <ListGroupItem key={index} className="pl-0 py-1">
                <IsaacHintModal questionPartId={questionPartId} hintIndex={index} label={`Hint ${index + 1}`} title={hint.title || `Hint ${index + 1}`} body={hint} scrollable/>
            </ListGroupItem>)}
        </ListGroup>
        <PintOnlyHints hints={hints} />
    </div>;
};

export const IsaacTabbedHints = ({hints}: HintsProps) => {
    return <div className="tabbed-hints">
        {hints && <Tabs className="no-print" tabTitleClass="hint-tab-title" tabContentClass="mt-1" deselectable activeTabOverride={-1}>
            {Object.assign({}, ...hints.map((hint, index) => ({
                [hint.title || `Hint\u00A0${index + 1}`]: <div className="mt-3 mt-sm-4 mx-3 py-3 px-4 alert-secondary">
                    <IsaacContent doc={hint} />
                </div>
            })))}
        </Tabs>}
        <PintOnlyHints hints={hints} />
    </div>
};
