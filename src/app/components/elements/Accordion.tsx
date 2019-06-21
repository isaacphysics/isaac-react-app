import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";

interface AccordionsProps {
    id?: string;
    title?: string;
    className?: string;
    children: any;
}

export const Accordion = ({id, title, className, children}: AccordionsProps) => {
    // Hash anchoring
    let idParts: string[] = [];
    if (id) {
        idParts = id.split('|');
    }
    const anchorId = idParts.length > 1 ? idParts[1] : null;

    useEffect(() => {
        const fragment = window.location.hash.slice(1);
        if (fragment === anchorId) {
            const element = document.getElementById(fragment);
            if (element) {
                element.scrollIntoView(true);
            }
        }
    });

    // Toggle
    const [open, setOpen] = useState(false);

    return <div className="accordion">
        <RS.Button
            id={anchorId || ""} block color="link"
            onClick={() => {setOpen(!open)}}
            className={open ? 'active p-3 text-left' : 'p-3 text-left'}
        >
            Section A: {title}
        </RS.Button>
        <RS.Collapse className="mt-1" isOpen={open}>
            <RS.Card>
                <RS.CardBody>
                    {children}
                </RS.CardBody>
            </RS.Card>
        </RS.Collapse>
    </div>;

    /*
     */
};
