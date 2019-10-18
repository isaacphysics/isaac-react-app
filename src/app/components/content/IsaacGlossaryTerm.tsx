import React from 'react';
import {Col, Row} from "reactstrap";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacContent} from "./IsaacContent";

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
}

// TODO add figure counting and linking
export const IsaacGlossaryTerm = ({doc}: IsaacGlossaryTermProps) => {
    return <Row className="glossary_term">
        <Col md={3}>
            <a id={doc.id && doc.id.split('|')[1]}><strong>{doc.value}</strong></a>
        </Col>
        <Col>
            {/* <IsaacContentValueOrChildren encoding={doc.encoding}>
                { doc.explanation && doc.explanation.children }
            </IsaacContentValueOrChildren> */}
            { doc.explanation && <IsaacContent doc={doc.explanation} />}
        </Col>
    </Row>;
};
