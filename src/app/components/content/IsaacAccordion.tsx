import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {Accordion} from "../elements/Accordion";

interface IsaacAccordionProps {
    doc: {
        children: {id?: string; title?: string; children?: ContentDTO[]}[];
    };
}

export const IsaacAccordion = (props: any) => {
    const {doc: {children}} = props as IsaacAccordionProps;
    return <div className="isaac-accordion">
        {children.map((child, index) => (
            <Accordion key={child.id} trustedTitle={child.title} id={child.id} index={index} content={child}/>
        ))}
    </div>;
};
