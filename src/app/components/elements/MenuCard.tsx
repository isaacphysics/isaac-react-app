import React from "react";
import classNames from "classnames";
import {Card, CardBody, CardTitle, Col, Row} from "reactstrap";

interface HexagonProps {
    link: string;
    imageSrc: string;
    title: string;
    subtitle?: string;
    disabled?: boolean;
    verticalContent?: boolean;
}

export const MenuCard = ({link, imageSrc, title, subtitle, disabled, verticalContent}: HexagonProps ) => {
    let classes = classNames({"menu-card": true, "disabled": disabled, "teacher-feature": verticalContent});
    return <a href={link} className={classes} aria-disabled={disabled} >
        {verticalContent ?
            <Card className={classes}>
                <Row>
                    <Col className="justify-content-md-center">
                        <img className={classes} src={imageSrc} alt=""/>
                    </Col>
                </Row>
                <CardTitle className="px-3">
                    <Row>
                        <Col>
                            {title}
                        </Col>
                    </Row>
                </CardTitle>
                <CardBody className="px-3">
                    <Row>
                        <Col>
                            {subtitle}
                        </Col>
                    </Row>
                </CardBody>
            </Card> :
            <Card>
                <CardTitle className="px-3">
                    <Row>
                        <Col>
                            {title}
                        </Col>
                    </Row>
                </CardTitle>
                <CardBody className="px-3">
                    <Row>
                        <Col md="3"  className="justify-content-md-center col-centered">
                            <img className={classes} src={imageSrc} alt=""/>
                        </Col>
                        <Col md="9">
                            <aside>
                                {subtitle}
                            </aside>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        }
    </a>
};
