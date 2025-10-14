import React, {Ref} from 'react';
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {formatGlossaryTermId} from "../pages/Glossary";
import { Col, Row } from 'reactstrap';

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
    inPortal?: boolean;
    linkToGlossary?: boolean;
}

const IsaacGlossaryTermComponent = ({doc, inPortal, linkToGlossary}: IsaacGlossaryTermProps, ref: Ref<HTMLParagraphElement>) => {
    return <Row className={"d-inline-flex d-md-flex"} key={doc.id}>
        <Col md={inPortal ? 2 : 3} className={"glossary-term-name"}>
            <p ref={ref} className={inPortal ? "mb-0 mb-md-3" : "fw-bold"}>
                {linkToGlossary ? 
                    <a href={`#${(doc.id && formatGlossaryTermId(doc.id)) ?? ""}`}>
                        {doc.value}
                    </a> : 
                    doc.value
                }
                <span className="only-print">: </span>
            </p>
        </Col>
        <Col md={inPortal ? 10 : 7} className={"glossary-term-definition"}>
            {doc.explanation && <IsaacContent doc={doc.explanation} />}
        </Col>
    </Row>;
};

export const IsaacGlossaryTerm = React.forwardRef(IsaacGlossaryTermComponent);
