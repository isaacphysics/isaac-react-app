import {CodeDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import React from "react";
import {Link} from "react-router-dom";
import {Col, Row} from "reactstrap";

interface IsaacCodeProps {
    doc: CodeDTO;
}

export function IsaacCode(props: IsaacCodeProps) {
    const {doc: {code, pythonUrl, encoding, children}} = props;

    return <React.Fragment>
        <Col className="code-block">
            <Row>
                <Col>
                    <IsaacContentValueOrChildren value={code?.value} encoding={encoding}>
                        {code?.children}
                    </IsaacContentValueOrChildren>
                </Col>
            </Row>
            <Row>
                <Col className="code-caption">
                    <a href={pythonUrl} target="_blank" rel="noopener noreferrer">Python</a>
                </Col>
            </Row>
        </Col>
    </React.Fragment>
}
