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
        {children.map((child, index) => (
            <Accordion key={index} title={child.title} id={child.id} index={index} >
                {child.children && child.children.map((contentChild, index) => (
                    <IsaacContent key={index} doc={contentChild} />
                ))}
            </Accordion>
        ))}
    </div>;
};
