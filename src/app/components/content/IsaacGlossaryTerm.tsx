import React from 'react';
import {Col, Row} from "reactstrap";
import {ContentDTO, GlossaryTermDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services/api";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {FigureNumberingContext} from "../../../IsaacAppTypes";

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
            <IsaacContentValueOrChildren encoding={doc.encoding}>
                { doc.explanation && doc.explanation.children }
            </IsaacContentValueOrChildren>
        </Col>
    </Row>;
};
