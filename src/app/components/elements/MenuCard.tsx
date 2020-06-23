import React from "react";
import classNames from "classnames";
import {Card, CardBody, CardTitle, Col, Row} from "reactstrap";

interface HexagonProps {
    link: string;
    imageSrc: string;
    title: string;
    disabled?: boolean;
}

export const MenuCard = ({link, imageSrc, title, disabled}: HexagonProps ) => {
    let classes = classNames({"menu-card": true, "disabled": disabled});
    return <a href={link} className="menu-card" aria-disabled={disabled} >
        <Card outline color="green">
            <CardTitle>
                <h4>{title}</h4>
            </CardTitle>
            <CardBody>
                <Row>
                    <Col md="3">
                        <img className={classes} src={imageSrc} alt="" />
                    </Col>
                    <Col md="9">
                        <aside>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </aside>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </a>
};
