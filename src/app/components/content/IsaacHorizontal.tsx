import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {Col, Container, Row} from "reactstrap";

export const IsaacHorizontal = ({doc: {children}}: {doc: ContentDTO}) => {
    return children ? <Container className={"content-value mb-2"}>
        <Row>
            {children.map((child, index) => (
                <Col key={index} lg={Math.floor(12/(children.length))}>
                    <IsaacContent key={index} doc={child} />
                </Col>
            ))}
        </Row>
    </Container> : null;
};
