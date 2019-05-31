import React, {ReactElement} from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {AccordionSection} from "../elements/AccordionSection";
import {IsaacContent} from "./IsaacContent";

interface IsaacAccordionProps {
    doc: {
        children: {
            id?: string;
            title?: string;
            children?: ContentDTO[];
        }[];
    };
}

export const IsaacAccordion = (props: any) => {
    const {doc: {children}} = props as IsaacAccordionProps;
    return <div className="isaac-accordion">
        {children.map((child, index) => (
            <div key={index} className="accordion-section mb-5">
                <AccordionSection title={child.title} id={child.id}>
                    <React.Fragment>
                        {child.children && child.children.map((contentChild, index) => (
                            <IsaacContent key={index} doc={contentChild} />
                        ))}
                    </React.Fragment>
                </AccordionSection>
            </div>
        ))}
    </div>;
};
