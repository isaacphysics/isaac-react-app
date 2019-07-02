import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {withRouter} from "react-router-dom";
import {ALPHABET} from "../../services/constants";

interface AccordionsProps {
    id?: string;
    title?: string;
    index: number;
    location: {hash: string};
    children: React.ReactChildren;
}

function scrollVerticallyIntoView(element: Element) {
    const yPosition = element.getBoundingClientRect().top + pageYOffset;
    window.scrollTo(0, yPosition);
}

export const Accordion = withRouter(({id, title, index, children, location: {hash}}: AccordionsProps) => {
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
});
