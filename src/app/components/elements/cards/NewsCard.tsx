import React from "react";
import * as RS from "reactstrap";
import classnames from "classnames";
import {Link} from "react-router-dom";
import {IsaacPodDTO} from "../../../../IsaacApiTypes";
import {API_PATH} from "../../../services/constants";

export const NewsCard = ({newsItem, pod = false}: {newsItem: IsaacPodDTO; pod?: boolean}) => {
    const {id, title, value, image, url} = newsItem;

    return <RS.Card className={classnames({'card-neat': true, 'm-4': pod, 'mb-4': !pod})}>
        {image && <div className={'card-image text-center mt-3'}>
            <RS.CardImg
                className={'m-auto rounded-circle'} top
                src={API_PATH + "/" + image.src} alt={image.altText || `Illustration for ${title}`}
            />
        </div>}
        <RS.CardBody className="d-flex flex-column">
            {title && <RS.CardTitle tag="h3">{title}</RS.CardTitle>}
            <RS.CardText className="m-0 my-auto card-date-time">
                <span className="d-block my-2">
                    <span className="h5">
                        {value}
                    </span>
                </span>
            </RS.CardText>
            <RS.CardText>
                <Link className="focus-target" to={`${url}`}>
                    Read More
                </Link>
            </RS.CardText>
        </RS.CardBody>
    </RS.Card>
};
