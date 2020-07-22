import React, {useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {Col, Row} from "reactstrap";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {scrollVerticallyIntoView} from "../../services/scrollManager";
import {useCurrentExamBoard} from "../../services/examBoard";
import _startCase from 'lodash/startCase';

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
    location: {hash: string};
}

// TODO add figure counting and linking
const IsaacGlossaryTermComponent = ({doc, location: {hash}}: IsaacGlossaryTermProps) => {
    let anchorId = '';
    const idRegexp = new RegExp('([a-z0-9-_]+)\\|?(?:(aqa|ocr)\\|?)?([a-z0-9-_~]+)?');
    const parsedAnchorId = doc.id && idRegexp.exec(doc.id.split('|').slice(1).join('|'));
    if (parsedAnchorId) {
        anchorId = parsedAnchorId.slice(1,3).filter(i => typeof i === 'string').join('|').toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    const examBoard = useCurrentExamBoard();

    useEffect(() => {
        if (hash.includes("#")) {
            const hashAnchor = hash.slice(1).toLowerCase().replace(/[^a-z0-9]/g, '-');
            const element = document.getElementById(hashAnchor);
            if (element && anchorId) { // exists on page
                if (anchorId.indexOf(hashAnchor) === 0) {
                    scrollVerticallyIntoView(element);
                }
            }
        }
    }, [hash, anchorId]);

    return <React.Fragment>
        {(doc.examBoard == '' || examBoard === doc.examBoard) && <Row className="glossary_term">
            <Col md={3}>
                <p id={anchorId}><strong>{doc.value} {doc.tags && doc.tags.length > 0 && `(${doc.tags.map(tag => _startCase(tag.replace(/[^a-zA-Z0-9]/, ' '))).join(', ')})`}</strong></p>
            </Col>
            <Col>
                {doc.explanation && <IsaacContent doc={doc.explanation} />}
            </Col>
        </Row>}
    </React.Fragment>;
};

export const IsaacGlossaryTerm = withRouter(IsaacGlossaryTermComponent);
