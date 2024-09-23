import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {Col, Row} from "reactstrap";
import { usePathname } from "../../services";

export const IsaacHorizontal = ({doc: {children}}: {doc: ContentDTO}) => {
    const path = usePathname();
    const pageSplit = children ? Math.floor(12/(children.length)) : 12;

    return children ? <div className={"content-value"}>
        <Row className="p-0 m-0 dynamic-x-padding">
            {children.map((child, index) => (
                <Col key={index} md={path == "/about" ? pageSplit : 12} lg={pageSplit} className="pad">
                    <IsaacContent key={index} doc={child} />
                </Col>
            ))}
        </Row>
    </div> : null;
};
