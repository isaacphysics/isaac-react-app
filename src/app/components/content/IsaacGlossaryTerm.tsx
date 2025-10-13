import React, {Ref} from 'react';
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {formatGlossaryTermId} from "../pages/Glossary";
import { Spacer } from '../elements/Spacer';
import { Col, Row } from 'reactstrap';

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
    inPortal?: boolean;
    linkToGlossary?: boolean;
}

const IsaacGlossaryTermComponent = ({doc, inPortal, linkToGlossary}: IsaacGlossaryTermProps, ref: Ref<any>) => {
    return <Row className={"glossary-term d-inline-flex d-md-flex row"} key={doc.id}>
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
            <Spacer/>
        </Col>
        <Col size={inPortal ? 10 : 7} className={"glossary-term-definition"}>
            {doc.explanation && <IsaacContent doc={doc.explanation} />}
        </Col>
    </Row>;
};

export const IsaacGlossaryTerm = React.forwardRef(IsaacGlossaryTermComponent);
