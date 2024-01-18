import React from "react";
import { CardBody, Col, Container, Row } from "reactstrap";
import { isAda, isPhy } from "../../../services";
import classNames from "classnames";

export interface MyAccountTabProps {
    leftColumn: React.ReactNode;
    rightColumn: React.ReactNode;
}

export const MyAccountTab = ({leftColumn, rightColumn} : MyAccountTabProps) => {
    return <CardBody className={classNames("my-account-tab px-4", {"px-sm-5": isAda})}>
        <Container>
            {isPhy ? <Col className="px-0 px-lg-2">
                {leftColumn}
                <Row className="pt-4"/>
                {rightColumn}
            </Col> :
            <Row>
                <Col lg={6} className="pr-lg-4 px-0 pl-lg-2">
                    {leftColumn}
                </Col>
                <Col lg={6} className="pl-lg-4 px-0 pl-lg-2 pt-4 pt-lg-0">
                    {rightColumn}
                </Col>
            </Row>}
        </Container>
    </CardBody>;
};