import React, {ReactElement} from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {Accordion} from "../elements/Accordion";
import {IsaacContent} from "./IsaacContent";

interface IsaacAccordionProps {
    doc: {
        children: {id?: string; title?: string; children?: ContentDTO[]}[];
    };
}

export const IsaacAccordion = (props: any) => {
    const {doc: {children}} = props as IsaacAccordionProps;
    return <div className="isaac-accordion">
        {children.map(child => (
            <Accordion key={child.id} className="accordion-section" title={child.title} id={child.id}>
                {child.children && child.children.map(contentChild => (
                    <IsaacContent key={contentChild.id} doc={contentChild} />
                ))}
            </Accordion>
        ))}
    </div>;
};
