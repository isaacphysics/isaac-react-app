import React, { Ref } from "react";
import { Col, Row } from "reactstrap";
import { GlossaryTermDTO } from "../../../IsaacApiTypes";
import { IsaacContent } from "./IsaacContent";

interface IsaacGlossaryTermProps {
  doc: GlossaryTermDTO;
  inPortal?: boolean;
}

const IsaacGlossaryTermComponent = ({ doc, inPortal }: IsaacGlossaryTermProps, ref: Ref<any>) => {
  const termContents = (
    <>
      <Col md={3} className="glossary_term_name">
        <p ref={ref}>
          <strong>{doc.value}</strong>
          <span className="only-print">: </span>
        </p>
      </Col>
      <Col md={7}>
        {doc.explanation && <IsaacContent doc={doc.explanation} />}
        {/* {_tags && _tags.length > 0 && <p className="topics">Used in: {_tags.map(tag => tag.title).join(', ')}</p>} */}
      </Col>
    </>
  );

  return inPortal === true ? (
    termContents
  ) : (
    <Row className="glossary_term" key={doc.id}>
      {termContents}
    </Row>
  );
};

export const IsaacGlossaryTerm = React.forwardRef(IsaacGlossaryTermComponent);
