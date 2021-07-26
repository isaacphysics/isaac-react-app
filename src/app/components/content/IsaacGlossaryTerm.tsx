import React, {useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {Col, Row} from "reactstrap";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {scrollVerticallyIntoView} from "../../services/scrollManager";
import {useUserContext} from "../../services/userContext";
import tags from "../../services/tags";
import { isDefined } from '../../services/miscUtils';
import { SITE, SITE_SUBJECT } from '../../services/siteConstants';
import { TAG_ID } from '../../services/constants';
import { Tag } from '../../../IsaacAppTypes';

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
    location: {hash: string};
    linkToGlossary: boolean;
}

const IsaacGlossaryTermComponent = ({doc, location: {hash}, linkToGlossary = false}: IsaacGlossaryTermProps) => {
    let anchorId = '';
    const idRegexp = new RegExp('([a-z0-9-_]+)\\|?(?:(aqa|ocr)\\|?)?([a-z0-9-_~]+)?');
    const parsedAnchorId = doc.id && idRegexp.exec(doc.id.split('|').slice(1).join('|'));
    if (parsedAnchorId) {
        anchorId = parsedAnchorId.slice(1,3).filter(i => typeof i === 'string').join('|').toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    const {examBoard} = useUserContext();

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

    let _tags: Tag[] = [];
    if (SITE_SUBJECT === SITE.CS && doc.tags) {
        _tags = doc.tags.map(id => tags.getById(id as TAG_ID)).filter(tag => isDefined(tag));
    }

    return <React.Fragment>
        {(!isDefined(doc.examBoard) || doc.examBoard === '' || examBoard === doc.examBoard) && <Col><Row className="glossary_term">
            <Col md={3} className="glossary_term_name">
                <p id={anchorId}>
                    {linkToGlossary && <a href={location.origin + location.pathname + '#' + anchorId}>
                        <img src="/assets/link-variant.png" className="pr-2" alt="direct link" />
                        <strong>{doc.value}</strong>
                    </a>}
                    {!linkToGlossary && <strong>{doc.value}</strong>}
                    <span className="only-print">: </span>
                </p>
            </Col>
            <Col>
                {doc.explanation && <IsaacContent doc={doc.explanation} />}
                {/* {_tags && _tags.length > 0 && <p className="topics">Used in: {_tags.map(tag => tag.title).join(', ')}</p>} */}
            </Col>
        </Row></Col>}
    </React.Fragment>;
};

export const IsaacGlossaryTerm = withRouter(IsaacGlossaryTermComponent);
