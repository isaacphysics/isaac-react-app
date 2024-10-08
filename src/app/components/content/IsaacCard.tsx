import React from "react";
import {Button, Card, CardBody, CardFooter, CardImg, CardTitle, Col, Row} from "reactstrap";
import classNames from "classnames";
import {apiHelper, isAppLink, siteSpecific} from "../../services";
import {Link} from "react-router-dom";
import {IsaacCardDTO} from "../../../IsaacApiTypes";

interface IsaacCardProps {
    doc: IsaacCardDTO;
    imageClassName?: string;
    className?: string;
}

const PhysicsCard = ({doc, imageClassName, className}: IsaacCardProps) => {
    const {title, subtitle, image, clickUrl, disabled, verticalContent} = doc;
    const classes = classNames(className + " menu-card", {"disabled": disabled, "isaac-card-vertical": verticalContent});
    const imgSrc = image?.src && apiHelper.determineImageUrl(image.src);

    const link = (clickUrl && isAppLink(clickUrl)) ? <Link to={clickUrl} className={"stretched-link"} aria-label={title} aria-disabled={disabled}/> :
        <a href={clickUrl} className={"stretched-link"} aria-label={title} aria-disabled={disabled}/>

    return <Col className="d-flex h-100 justify-content-center">
        {verticalContent ?
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
            <Card className="w-100">
                <CardTitle className="px-3 mb-sm-0 mb-lg-2">
                    {title}
                </CardTitle>
                <CardBody>
                    <Row className="h-100 mx-2">
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
            </Card>
        }
    </Col>;
};

const AdaCard = ({doc, imageClassName}: IsaacCardProps) => {
    const {title, subtitle, image, clickUrl, disabled, verticalContent} = doc;
    const imageSrc = image?.src && apiHelper.determineImageUrl(image.src);
    return <Card className={classNames("cs-card border-0", {[imageClassName ?? ""]: !image})}>
        {image && <CardImg className={imageClassName} src={imageSrc} alt={image.altText}/>}
        <CardTitle className={"px-4 mt-5"}>
            <h3 className={"mt-1"}>{title}</h3>
        </CardTitle>
        <CardBody className={"px-4"}>
            <p>{subtitle}</p>
        </CardBody>
        {clickUrl && isAppLink(clickUrl) && <CardFooter className={"border-top-0 p-4"}>
            <Button disabled={disabled} outline color="secondary" tag={Link} to={clickUrl}>{doc?.buttonText || "See more"}</Button>
        </CardFooter>}
    </Card>;
};

export const IsaacCard = siteSpecific(PhysicsCard, AdaCard);
