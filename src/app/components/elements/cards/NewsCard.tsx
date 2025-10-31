import React from "react";
import {Link} from "react-router-dom";
import {Card, CardBody, CardImg, CardProps, CardText} from "reactstrap";
import {ImageDTO, IsaacPodDTO} from "../../../../IsaacApiTypes";
import {apiHelper, siteSpecific} from "../../../services";
import {AdaCard} from "./AdaCard";
import classNames from "classnames";
import { Spacer } from "../Spacer";

interface NewsCardProps extends CardProps {
    newsItem: IsaacPodDTO;
    showTitle?: boolean;
    cardClassName?: string;
}

const PhysicsNewsCard = ({newsItem, showTitle=true, cardClassName: _cardClassName, ...props}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;

    const CardImage = (image: ImageDTO) => {
        return <CardImg
            top
            src={image.src && apiHelper.determineImageUrl(image.src)}
            alt={image.altText || `Illustration for ${title}`}
        />;
    };

    return <Card data-testid={"news-pod"} {...props} className={classNames("pod news-card", props.className)}>
        {image && (!url?.startsWith("http") ?
            <Link to={`${url}`} className="focus-target pod-img">
                <CardImage {...image}/>
            </Link>
            :
            <a href={url} className="focus-target pod-img">
                <CardImage {...image}/>
            </a>
        )}
        <CardBody className="d-flex flex-column">
            {showTitle && <h5>{title}</h5>}
            {value && <CardText>
                {value}
            </CardText>}
            <Spacer/>
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
    return <AdaCard {...props} data-testid={"news-pod"} className="px-3 my-3" card={{
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
