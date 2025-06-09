import React from "react";
import { CardBody, Col, Container, Row } from "reactstrap";
import { siteSpecific } from "../../../services";
import classNames from "classnames";

export interface MyAccountTabProps {
    leftColumn: React.ReactNode;
    rightColumn: React.ReactNode;
    className?: string;
}

export const MyAccountTab = ({leftColumn, rightColumn, className} : MyAccountTabProps) => {
    return siteSpecific(
        <div>
            {leftColumn}
            {rightColumn}
        </div>,   
        
        <CardBody className={classNames("my-account-tab px-4 px-sm-5", className)}>
            <Container>
                <Row>
                    <Col lg={6} className="my-account-left pe-lg-4 ps-lg-2">
                        {leftColumn}
                    </Col>
                    <Col lg={6} className="my-account-right ps-lg-4 ps-lg-2 pt-lg-0">
                        {rightColumn}
                    </Col>
                </Row>
            </Container>
        </CardBody>
    );
};
