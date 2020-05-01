import {ListGroup, ListGroupItem} from "reactstrap";
import {IsaacHintModal} from "./IsaacHintModal";
import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import {useSelector} from "react-redux";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {Tabs} from "../elements/Tabs";

interface HintsProps {
    hints?: ContentDTO[];
    questionPartId: string;
}
const IsaacHintsCS = ({hints, questionPartId}: HintsProps) => {
    const hintsEnabled = useSelector((state: AppState) => state?.printingSettings?.hintsEnabled);
    return <div>
        <ListGroup className="question-hints mb-1 pt-3 mt-3 no-print">
            {hints?.map((hint, index) => <ListGroupItem key={index} className="pl-0 py-1">
                <IsaacHintModal questionPartId={questionPartId} hintIndex={index} label={`Hint ${index + 1}`} title={hint.title || `Hint ${index + 1}`} body={hint} scrollable/>
            </ListGroupItem>)}
        </ListGroup>
        {hintsEnabled && hints?.map((hint, index) => (
            <div key={index} className={"question-hints pl-0 py-1 only-print"}>
                <h4>{`Hint ${index + 1}`}</h4>
                <IsaacContent doc={hint} />
            </div>
        ))}
    </div>;
};

const IsaacHintsPhy = ({hints}: HintsProps) => {
    const hintsEnabled = useSelector((state: AppState) => state?.printingSettings?.hintsEnabled);
    return <div>
        {hints && <Tabs className="no-print" tabTitleClass="hint-tab-title" tabContentClass="mt-1" unselectable activeTabOverride={-1}>
            {Object.assign({}, ...hints.map((hint, index) =>
                ({[hint.title || `Hint\u00A0${index + 1}`]: <div className="mt-3 mx-3"><IsaacContent doc={hint} /></div>})
            ))}
        </Tabs>}
        {hintsEnabled && hints?.map((hint, index) => (
            <div key={index} className={"question-hints pl-0 py-4 only-print"}>
                <h4>{`Hint ${index + 1}`}</h4>
                <IsaacContent doc={hint} />
            </div>
        ))}
    </div>
};

export const IsaacHints = {[SITE.CS]: IsaacHintsCS, [SITE.PHY]: IsaacHintsPhy}[SITE_SUBJECT];
