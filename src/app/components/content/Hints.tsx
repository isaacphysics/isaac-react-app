import {ListGroup, ListGroupItem} from "reactstrap";
import {HintModal} from "./HintModal";
import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";

interface HintsProps {
    hints: ContentDTO[];
}
export const Hints = ({hints}: HintsProps) => {
    return <ListGroup className="question-hints mb-1 pt-3">
        {hints.map((hint, index) => <ListGroupItem key={index} className="pl-0 py-1">
            <HintModal label={`Hint ${index + 1}`} title={hint.title || `Hint ${index + 1}`} body={hint} scrollable />
        </ListGroupItem>)}
    </ListGroup>;
};
