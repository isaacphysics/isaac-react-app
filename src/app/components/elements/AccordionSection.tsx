import React, {useState, useEffect} from "react";

interface AccordionsProps {
    id?: string;
    title?: string;
    children: {};
}

export const AccordionSection = ({id, title, children}: AccordionsProps) => {
    let idParts: Array<string> = [];
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

    return <React.Fragment>
        {title && <h2 className="h-question mb-4" id={anchorId || ""}>
            <span className="mr-3">
                {title}
            </span>
        </h2>}
        {children}
    </React.Fragment>;
};
