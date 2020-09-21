import React from "react";
import {Card, CardBody, CardTitle, Col, Row} from "reactstrap";
import classNames from "classnames";
import {apiHelper} from "../../services/api";
import {Link} from "react-router-dom";
import {isAppLink} from "../../services/navigation";
import {IsaacCardDTO} from "../../../IsaacApiTypes";


export const IsaacCard = ({doc}: {doc: IsaacCardDTO}) => {
    const {title, subtitle, image, clickUrl, disabled, verticalContent} = doc;
    const classes = classNames({"menu-card": true, "disabled": disabled, "isaac-card-vertical": verticalContent});
    const imgSrc = image?.src && apiHelper.determineImageUrl(image.src);

    const link = (clickUrl && isAppLink(clickUrl)) ? <Link to={clickUrl} className={classes + " stretched-link"} aria-disabled={disabled}/> :
        <a href={clickUrl} className={classes + " stretched-link"} aria-disabled={disabled}/>

    return verticalContent ?
        <Card className={classes}>
            {image && <Row>
                <Col className="justify-content-md-center">
                    <img className={classes} src={imgSrc} alt=""/>
                </Col>
            </Row>}
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
            {clickUrl && link}
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
                    {image && <Col md="3" className="justify-content-md-center col-centered">
                        <img className={classes} src={imgSrc} alt=""/>
                    </Col>}
                    <Col md="9">
                        <aside>
                            {subtitle}
                        </aside>
                    </Col>
                </Row>
            </CardBody>
            {clickUrl && link}
        </Card>;
};