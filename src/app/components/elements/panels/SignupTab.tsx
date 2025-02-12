import React from "react";
import { Col, Row } from "reactstrap";
import { siteSpecific } from "../../../services";

export interface SignupTabProps {
    leftColumn: React.ReactNode;
    rightColumn: React.ReactNode;
}

export const SignupTab = ({leftColumn, rightColumn} : SignupTabProps) => {
    return siteSpecific(
        <div>
            {leftColumn}
            {rightColumn}
        </div>,   
        
        <Row className="align-items-start">
            <Col xs={12} lg={6}>
                {leftColumn}
            </Col>
            <Col xs={12} lg={5}>
                {rightColumn}
            </Col>
        </Row>
    );
};
