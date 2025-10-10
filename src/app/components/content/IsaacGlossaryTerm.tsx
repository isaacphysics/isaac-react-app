import React, {Ref} from 'react';
import {Col, Row} from "reactstrap";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {formatGlossaryTermId} from "../pages/Glossary";
import classNames from 'classnames';

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
    inPortal?: boolean;
    linkToGlossary?: boolean;
}

const IsaacGlossaryTermComponent = ({doc, inPortal, linkToGlossary}: IsaacGlossaryTermProps, ref: Ref<any>) => {
    return <div className={classNames("glossary_term d-md-flex", {"row": !inPortal})} key={doc.id}>
        <div className={classNames("glossary_term_name", {"col-md-3": !inPortal, "me-4": inPortal})}>
            <p ref={ref} className={classNames({"fw-bold": !inPortal, "mb-1 mb-md-3": inPortal})}>
                {linkToGlossary ? 
                    <a href={`#${(doc.id && formatGlossaryTermId(doc.id)) ?? ""}`}>
                        {doc.value}
                    </a> : 
                    doc.value
                }
                <span className="only-print">: </span>
            </p>
        </div>
        <div className={classNames("glossary_term_definition", {"col-md-7": !inPortal})}>
            {doc.explanation && <IsaacContent doc={doc.explanation} />}
        </div>
    </div>;
};

export const IsaacGlossaryTerm = React.forwardRef(IsaacGlossaryTermComponent);
