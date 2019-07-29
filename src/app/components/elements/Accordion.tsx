import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {withRouter} from "react-router-dom";
import {ALPHABET} from "../../services/constants";
import {store} from "../../state/store";
import {connect} from "react-redux";
import {logAction} from "../../state/actions";

interface AccordionsProps {
    id?: string;
    title?: string;
    index: number;
    location: {hash: string};
    children: React.ReactChildren;
    logAction: (eventDetails: object) => void;
}

function scrollVerticallyIntoView(element: Element) {
    const yPosition = element.getBoundingClientRect().top + pageYOffset;
    window.scrollTo(0, yPosition);
}

const AccordionComponent = ({id, title, index, children, location: {hash}}: AccordionsProps) => {
    // Toggle
    const isFirst = index === 0;
    const [open, setOpen] = useState(isFirst);

    // Hash anchoring
    let anchorId: string | null = null;
    if (id) {
        const idParts = id.split("|");
        if (idParts.length > 1) {
            anchorId = idParts[1];
        }
    }

    useEffect(() => {
        if (hash.includes("#")) {
            const hashAnchor = hash.slice(1);
            const element = document.getElementById(hashAnchor);
            if (element) { // exists on page
                if (hashAnchor === anchorId) {
                    scrollVerticallyIntoView(element);
                    setOpen(true);
                } else {
                    setOpen(false);
                }
            }
        }
    }, [hash, anchorId]);

    return <div className="accordion">
        <div className="accordion-header">
            <RS.Button
                id={anchorId || ""} block color="link"
                className={open ? 'active p-3 pr-5 text-left' : 'p-3 pr-5 text-left'}
                onClick={(event: any) => {
                    const nextState = !open;
                    const page = store.getState().doc;
                    if (nextState) {
                        switch (page.type) {
                            case "isaacQuestionPage":
                                logAction({type: "QUESTION_PART_OPEN", questionPageId: page.id, questionPartIndex: index, questionPartId: id});
                                break;
                            case "isaacConceptPage":
                                logAction({type: "CONCEPT_SECTION_OPEN", conceptPageId: page.id, conceptSectionIndex: index, conceptSectionLevel: null, conceptSectionId: id});
                                // TODO for IP add doc.level for conceptSectionLevel event
                                break;
                        }
                    }
                    setOpen(nextState);
                    if (nextState) {
                        scrollVerticallyIntoView(event.target);
                    }
                }}
            >
                <span className="accordion-part text-secondary pr-2">
                    Part {ALPHABET[index % ALPHABET.length]}
                </span> {" "}
                {title}
            </RS.Button>
        </div>
        <RS.Collapse isOpen={open} className="mt-1">
            <RS.Card>
                <RS.CardBody>
                    {children}
                </RS.CardBody>
            </RS.Card>
        </RS.Collapse>
    </div>;
};

export const Accordion = withRouter(connect(null, {logAction: logAction})(AccordionComponent));
