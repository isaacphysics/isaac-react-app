import React from "react";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import {IsaacPodDTO} from "../../../../IsaacApiTypes";
import {apiHelper} from "../../../services/api";

interface NewsCardProps {
    newsItem: IsaacPodDTO;
    showTitle?: boolean;
}

export const NewsCard = ({newsItem, showTitle}: NewsCardProps) => {
    const {title, value, image, url} = newsItem;

    return <RS.Card className={"card-neat news-card"}>
        {image && <a href={url}>
            <RS.CardImg
                className={'news-card-image'}
                top
                src={image.src && apiHelper.determineImageUrl(image.src)}
                alt={image.altText || `Illustration for ${title}`}
            />
        </a>}
        <RS.CardBody className="d-flex flex-column">
            <div className="m-0 mb-auto">
                <span className="d-block my-2">
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
            <RS.CardText>
                {!url?.startsWith("http") ?
                    <Link className="focus-target" to={`${url}`}>
                        Read more
                    </Link> :
                    // eslint-disable-next-line react/jsx-no-target-blank
                    <a className="focus-target" href={url} target="_blank" rel="noopener">
                        Find out more
                    </a>
                }
            </RS.CardText>
        </RS.CardBody>
    </RS.Card>
};
