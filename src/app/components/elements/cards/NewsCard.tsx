import React from "react";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardFooter, CardImg, CardProps, CardText, CardTitle, Container} from "reactstrap";
import {IsaacPodDTO} from "../../../../IsaacApiTypes";
import {apiHelper, isAppLink, siteSpecific} from "../../../services";
import classNames from "classnames";
import { ExternalLink } from "../ExternalLink";
import { AdaCard } from "./AdaCard";

interface NewsCardProps extends CardProps {
    newsItem: IsaacPodDTO;
    showTitle?: boolean;
    cardClassName?: string;
}

const PhysicsNewsCard = ({newsItem, showTitle, ...props}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;

    return <Card data-testid={"news-pod"} {...props} className={classNames("w-100 mx-3 mb-0 card-neat news-card", props.className)}>
        {image && <a href={url} className="focus-target">
            <CardImg
                top
                src={image.src && apiHelper.determineImageUrl(image.src)}
                alt={image.altText || `Illustration for ${title}`}
            />
        </a>}
        <CardBody className="d-flex flex-column">
            <div className="m-0 mb-auto">
                <span className="d-block mb-2 news-card-text">
                    {showTitle ?
                        <div>
                            <h3 className="card-title">
                                {title}
                            </h3>
                            <p>
                                {value}
                            </p>
                        </div>:
                        <h3 className="card-title">
                            {value}
                        </h3>
                    }
                </span>
            </div>
            <CardText>
                {!url?.startsWith("http") ?
                    <Link aria-label={`${title} read more`} className="focus-target" to={`${url}`}>
                        Read more
                    </Link> :
                    // eslint-disable-next-line react/jsx-no-target-blank
                    <a className="focus-target" href={url} target="_blank" rel="noopener">
                        Find out more
                    </a>
                }
            </CardText>
        </CardBody>
    </Card>;
};

export const AdaNewsCard = ({newsItem, showTitle, cardClassName, ...props}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;
    return <AdaCard {...props} card={{
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
