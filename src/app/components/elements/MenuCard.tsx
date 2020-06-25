import React from "react";
import classNames from "classnames";
import {Card, CardBody, CardTitle, Col, Row} from "reactstrap";

interface HexagonProps {
    link: string;
    imageSrc: string;
    title: string;
    subtitle?: string;
    disabled?: boolean;
    teacherFeature?: boolean;
}

export const MenuCard = ({link, imageSrc, title, subtitle, disabled, teacherFeature}: HexagonProps ) => {
    let classes = classNames({"menu-card": true, "disabled": disabled, "teacher-feature": teacherFeature});
    return <a href={link} className={classes} aria-disabled={disabled} >
        {teacherFeature ?
            <Card className={classes}>
                <Row>
                    <Col className="justify-content-md-center">
                        <img className={classes} src={imageSrc} alt=""/>
                    </Col>
                </Row>
                <CardTitle>
                    {title}
                </CardTitle>
                <CardBody>
                    <Row>
                        <Col>
                            {subtitle}
                        </Col>
                    </Row>
                </CardBody>
            </Card> :
            <Card>
                <CardTitle>
                    {title}
                </CardTitle>
                <CardBody>
                    <Row>
                        <Col md="3">
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
