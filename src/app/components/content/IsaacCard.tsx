import React from "react";
import {Button, Card, CardBody, CardFooter, CardTitle, Col, Row} from "reactstrap";
import classNames from "classnames";
import {apiHelper, isAppLink, siteSpecific} from "../../services";
import {Link} from "react-router-dom";
import {IsaacCardDTO} from "../../../IsaacApiTypes";

interface IsaacCardProps {
    doc: IsaacCardDTO,
    imageClassName?: string
}

const PhysicsCard = ({doc, imageClassName}: IsaacCardProps) => {
    const {title, subtitle, image, clickUrl, disabled, verticalContent} = doc;
    const classes = classNames({"menu-card": true, "disabled": disabled, "isaac-card-vertical": verticalContent});
    const imgSrc = image?.src && apiHelper.determineImageUrl(image.src);

    const link = (clickUrl && isAppLink(clickUrl)) ? <Link to={clickUrl} className={classes + " stretched-link"} aria-disabled={disabled}/> :
        <a href={clickUrl} className={classes + " stretched-link"} aria-disabled={disabled}/>

    return verticalContent ?
        <Card className={classes}>
            {image && <Row className={imageClassName}>
                <Col className="justify-content-md-center">
                    <img className={[classes, imageClassName].join(" ")} src={imgSrc} alt={image.altText}/>
                </Col>
            </Row>}
            <CardTitle className="px-3">
                {title}
            </CardTitle>
            <CardBody className="px-3">
                {subtitle}
            </CardBody>
            {clickUrl && link}
        </Card> :
        <Card>
            <CardTitle className="px-3 mb-sm-0 mb-lg-2">
                {title}
            </CardTitle>
            <CardBody>
                <Row className="mx-2">
                    {image && <Col xs={4} sm={12} lg={4} className="col-centered">
                        <img className={classes} src={imgSrc} alt=""/>
                    </Col>}
                    <Col xs={image ? 8 : 12} sm={12} lg={image ? 8 : 12}>
                        <aside>
                            {subtitle}
                        </aside>
                    </Col>
                </Row>
            </CardBody>
            {clickUrl && link}
        </Card>;
};

const AdaCard = ({doc, imageClassName}: IsaacCardProps) => {
    const {title, subtitle, image, clickUrl, disabled, verticalContent} = doc;
    return <Card className={classNames("cs-card border-0 py-4 pt-5 my-4 my-lg-0", imageClassName)}>
        <CardTitle className={"px-4 mt-1"}>
            <h4>{title}</h4>
        </CardTitle>
        <CardBody className={"px-4"}>
            <p>{subtitle}</p>
        </CardBody>
        {clickUrl && isAppLink(clickUrl) && <CardFooter className={"bg-white border-top-0 pt-0"}>
            <Button disabled={disabled} outline color={"dark-pink"} tag={Link} to={clickUrl}>See more</Button>
        </CardFooter>}
    </Card>;
};

export const IsaacCard = siteSpecific(PhysicsCard, AdaCard);