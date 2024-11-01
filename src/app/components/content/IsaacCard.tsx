import React from "react";
import {Card, CardBody, CardTitle, Col, ContainerProps, Row} from "reactstrap";
import classNames from "classnames";
import {apiHelper, isAppLink, siteSpecific} from "../../services";
import {Link} from "react-router-dom";
import {IsaacCardDTO} from "../../../IsaacApiTypes";
import { AdaCard } from "../elements/cards/AdaCard";

interface IsaacCardProps extends ContainerProps {
    doc: IsaacCardDTO;
    imageClassName?: string;
    className?: string;
}

const PhysicsContentCard = ({doc, imageClassName, className, ...rest}: IsaacCardProps) => {
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

const AdaContentCard = ({doc, imageClassName, ...rest}: IsaacCardProps) => {
    const {title, subtitle, image, clickUrl, disabled, verticalContent} = doc;
    const imageSrc = image?.src && apiHelper.determineImageUrl(image.src);
    
    return <AdaCard card={{
        title: title ?? "",
        image: {src: imageSrc ?? "", altText: image?.altText},
        bodyText: subtitle ?? "",
        clickUrl: clickUrl,
        buttonText: doc.buttonText,
        disabled: disabled,
        ...rest
    }}/>;
};

export const IsaacCard = siteSpecific(PhysicsContentCard, AdaContentCard);
