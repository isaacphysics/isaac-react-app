import React from "react";
import {Link} from "react-router-dom";
import {Card, CardBody, CardImg, CardProps, CardText} from "reactstrap";
import {IsaacPodDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";

interface NewsPodProps extends CardProps {
    newsItem: IsaacPodDTO;
}

const NewsPod = ({newsItem, ...props}: NewsPodProps) => {
    const {title, value, image, url} = newsItem;

    return <Card data-testid={"news-pod"} {...props} className="pod">
        {image && <a href={url} className="focus-target">
            <CardImg
                top
                src={image.src && apiHelper.determineImageUrl(image.src)}
                alt={image.altText || `Illustration for ${title}`}
                className="pod-img"
            />
        </a>}
        <CardBody>
            <b className="pod-title">
                {title}
            </b>
            <p>
                {value}
            </p>
            <CardText>
                {!url?.startsWith("http") ?
                    <Link aria-label={`${title} read more`} className="focus-target btn btn-secondary" to={`${url}`}>
                        Read more
                    </Link>
                    :
                    <a className="focus-target btn btn-secondary" href={url} target="_blank" rel="noopener">
                        Find out more
                    </a>
                }
            </CardText>
        </CardBody>
    </Card>;
};

export default NewsPod;
