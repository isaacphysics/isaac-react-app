import React from "react";
import {Link} from "react-router-dom";
import {Card, CardBody, CardImg, CardProps, CardText, CardTitle} from "reactstrap";
import {IsaacPodDTO} from "../../../../IsaacApiTypes";
import {apiHelper, siteSpecific} from "../../../services";
import {AdaCard} from "./AdaCard";
import classNames from "classnames";

interface NewsCardProps extends CardProps {
    newsItem: IsaacPodDTO;
    showTitle?: boolean;
    cardClassName?: string;
}

const PhysicsNewsCard = ({newsItem, ...props}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;
    return <Card data-testid={"news-pod"} {...props} className={classNames("pod news-card", props.className)}>
        {image && <a href={url} className="focus-target">
            <CardImg
                top
                src={image.src && apiHelper.determineImageUrl(image.src)}
                alt={image.altText || `Illustration for ${title}`}
            />
        </a>}
        <CardBody className="d-flex flex-column ps-0">
            <CardTitle className="mb-0 pod-title">{title}</CardTitle>
            <CardText>
                {value && <p>{value}</p>}
            </CardText>
            <CardText>
                {!url?.startsWith("http") ?
                    <Link aria-label={`${title} read more`} className="focus-target btn btn-keyline" to={`${url}`}>
                            Read more
                    </Link>
                    :
                    <a className="focus-target btn btn-keyline" href={url} target="_blank" rel="noopener">
                            Find out more
                    </a>
                }
            </CardText>
        </CardBody>
    </Card>;
};

const AdaNewsCard = ({newsItem, showTitle, cardClassName, ...props}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;
    return <AdaCard {...props} data-testid={"news-pod"} card={{
        title: showTitle && title || "",
        image: {
            src: (image?.src && apiHelper.determineImageUrl(image.src)) || "/assets/cs/decor/news-placeholder.png",
            altText: image?.altText || `Illustration for ${title}`,
        },
        bodyText: value ?? "",
        clickUrl: url,
        disabled: false,
        className: cardClassName,
    }}/>;
};

export const NewsCard = siteSpecific(PhysicsNewsCard, AdaNewsCard);
