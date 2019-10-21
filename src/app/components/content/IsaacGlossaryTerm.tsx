import React, {useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {Col, Row} from "reactstrap";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {scrollVerticallyIntoView} from "../../services/scrollManager";

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
    location: {hash: string};
}

// TODO add figure counting and linking
const IsaacGlossaryTermComponent = ({doc, location: {hash}}: IsaacGlossaryTermProps) => {
    let anchorId: string | undefined = doc.id && doc.id.split('|')[1];

    useEffect(() => {
        if (hash.includes("#")) {
            const hashAnchor = hash.slice(1);
            const element = document.getElementById(hashAnchor);
            if (element) { // exists on page
                if (hashAnchor === anchorId) {
                    scrollVerticallyIntoView(element);
                }
            }
        }
    }, [hash, anchorId]);

    return <Row className="glossary_term">
        <Col md={3}>
            <p id={anchorId}><strong>{doc.value}</strong></p>
        </Col>
        <Col>
            {doc.explanation && <IsaacContent doc={doc.explanation} />}
        </Col>
    </Row>;
};

export const IsaacGlossaryTerm = withRouter(IsaacGlossaryTermComponent);