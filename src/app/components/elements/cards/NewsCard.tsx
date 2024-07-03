import React from "react";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardFooter, CardImg, CardProps, CardText, CardTitle} from "reactstrap";
import {IsaacPodDTO} from "../../../../IsaacApiTypes";
import {apiHelper, isAppLink, siteSpecific} from "../../../services";
import classNames from "classnames";
import { ExternalLink } from "../ExternalLink";

interface NewsCardProps extends CardProps {
    newsItem: IsaacPodDTO;
    showTitle?: boolean;
}

const PhysicsNewsCard = ({newsItem, showTitle, ...props}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;

    return <Card data-testid={"news-pod"} {...props} className={classNames("card-neat news-card", props.className)}>
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

export const AdaNewsCard = ({newsItem, showTitle, ...props}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;
    return <Card data-testid={"news-pod"} {...props} className={classNames("news-card card-neat border-0 pb-3 my-3 my-xl-0", props.className)}>
        {image && <a href={url} className={"w-100"}>
            <CardImg
                className={"news-card-image"}
                top
                src={(image.src && apiHelper.determineImageUrl(image.src)) || "/assets/cs/decor/news-placeholder.png"}
                alt={image.altText || `Illustration for ${title}`}
            />
        </a>}
        {showTitle && <>
            <CardTitle className={classNames("news-card-title px-4", {"mt-5": !image, "mt-3": image})}>
                <h4>{title}</h4>
            </CardTitle>
            <CardBody className={"px-4 py-2"}>
                <p>{value}</p>
            </CardBody>
        </>}
        {url && <CardFooter className={"border-top-0 p-4"}>
            {!url?.startsWith("http") && isAppLink(url) ? (   
                <Button outline color={"secondary"} tag={Link} to={url}>Read more</Button>
            ) : (
                <Button outline color={"secondary"} tag={ExternalLink} href={url}>Find out more</Button>
            )}
        </CardFooter>}
    </Card>;
};

export const NewsCard = siteSpecific(PhysicsNewsCard, AdaNewsCard);