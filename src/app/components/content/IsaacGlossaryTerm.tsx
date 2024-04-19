import React, {Ref} from 'react';
import {Col, Row} from "reactstrap";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {isAda, isDefined, TAG_ID, tags} from "../../services";
import {Tag} from '../../../IsaacAppTypes';
import {formatGlossaryTermId} from "../pages/Glossary";

interface IsaacGlossaryTermProps {
    doc: GlossaryTermDTO;
    inPortal?: boolean;
    linkToGlossary?: boolean;
}

const IsaacGlossaryTermComponent = ({doc, inPortal, linkToGlossary}: IsaacGlossaryTermProps, ref: Ref<any>) => {
    let _tags: Tag[] = [];
    if (isAda && doc.tags) {
        _tags = doc.tags.map(id => tags.getById(id as TAG_ID)).filter(tag => isDefined(tag));
    }

    const termContents = <>
        <Col md={3} className="glossary_term_name">
            <p ref={ref}>
                {linkToGlossary && <a href={`#${(doc.id && formatGlossaryTermId(doc.id)) ?? ""}`}>
                    <img src="/assets/common/icons/link-variant.png" className="pr-2" alt="direct link" />
                    <strong>{doc.value}</strong>
                </a>}
                {!linkToGlossary && <strong>{doc.value}</strong>}
                <span className="only-print">: </span>
            </p>
        </Col>
        <Col md={7}>
            {doc.explanation && <IsaacContent doc={doc.explanation} />}
            {/* {_tags && _tags.length > 0 && <p className="topics">Used in: {_tags.map(tag => tag.title).join(', ')}</p>} */}
        </Col>
    </>

    return (inPortal === true) ? termContents : <Row className="glossary_term" key={doc.id}>{termContents}</Row>;
};

export const IsaacGlossaryTerm = React.forwardRef(IsaacGlossaryTermComponent);
