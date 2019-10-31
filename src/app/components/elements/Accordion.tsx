import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import {withRouter} from "react-router-dom";
import {ALPHABET} from "../../services/constants";
import {connect, useSelector} from "react-redux";
import {logAction} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {scrollVerticallyIntoView} from "../../services/scrollManager";
import {TrustedHtml} from "./TrustedHtml";
import {AccordionSectionContext} from "../../../IsaacAppTypes";

interface AccordionsProps {
    id?: string;
    trustedTitle?: string;
    index: number;
    location: {hash: string};
    children: React.ReactChildren;
    logAction: (eventDetails: object) => void;
}


const AccordionComponent = ({id, trustedTitle, index, children, location: {hash}}: AccordionsProps) => {
    // Toggle
    const isFirst = index === 0;
    const [open, setOpen] = useState(isFirst);
    const page = useSelector((state: AppState) => (state && state.doc) || null);

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

    function logAccordionOpen() {
        if (page && page != 404) {
            switch (page.type) {
                case "isaacQuestionPage":
                    logAction({
                        type: "QUESTION_PART_OPEN",
                        questionPageId: page.id,
                        questionPartIndex: index,
                        questionPartId: id
                    });
                    break;
                case "isaacConceptPage":
                    logAction({
                        type: "CONCEPT_SECTION_OPEN",
                        conceptPageId: page.id,
                        conceptSectionIndex: index,
                        conceptSectionLevel: null,
                        conceptSectionId: id
                    });
                    // TODO for IP add doc.level for conceptSectionLevel event
                    break;
                default:
                    logAction({
                        type: "ACCORDION_SECTION_OPEN",
                        pageId: page.id,
                        accordionId: id,
                        accordionTitle: trustedTitle,
                        accordionIndex: index
                    })
            }
        }
    }

    return<div className="accordion">
        <div className="accordion-header">
            <RS.Button
                id={anchorId || ""} block color="link"
                className={open ? 'active p-3 pr-5 text-left' : 'p-3 pr-5 text-left'}
                onClick={(event: any) => {
                    const nextState = !open;
                    setOpen(nextState);
                    if (nextState) {
                        logAccordionOpen();
                        scrollVerticallyIntoView(event.target);
                    }
                }}
                aria-expanded={open ? "true" : "false"}
            >
                <span className="accordion-part text-secondary pr-2">
                    Part {ALPHABET[index % ALPHABET.length]}
                </span> {" "}
                {trustedTitle && <TrustedHtml html={trustedTitle} />}
            </RS.Button>
        </div>
        <RS.Collapse isOpen={open} className="mt-1">
            <AccordionSectionContext.Provider value={trustedTitle}>
                <RS.Card>
                    <RS.CardBody>
                        {children}
                    </RS.CardBody>
                </RS.Card>
            </AccordionSectionContext.Provider>
        </RS.Collapse>
    </div>;
};

export const Accordion = withRouter(connect(null, {logAction: logAction})(AccordionComponent));
