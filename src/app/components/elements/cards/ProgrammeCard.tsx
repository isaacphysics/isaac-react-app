import classNames from "classnames";
import React from "react";
import { Card, CardBody, CardImg, CardProps, CardText } from "reactstrap";
import { Spacer } from "../Spacer";
import { Link } from "react-router-dom";
import { apiHelper } from "../../../services";
import { IsaacPodDTO } from "../../../../IsaacApiTypes";
import { Markup } from "../markup";
import { IsaacContentValueOrChildren } from "../../content/IsaacContentValueOrChildren";

export interface IsaacProgrammeDTO extends IsaacPodDTO {
    date?: string;
    applicableTo?: string;
    location?: string;
}

interface ProgrammeCardProps extends CardProps {
    programme: IsaacProgrammeDTO;
}

export const ProgrammeCard = ({ programme, ...rest}: ProgrammeCardProps) => {
    const {title, value, children, image, url} = programme;
    return <Card data-testid={"programme-pod"} {...rest} className={classNames("pod", rest.className)}>
        {image && <a href={url} className="focus-target pod-img">
            <CardImg
                top
                src={image.src && apiHelper.determineImageUrl(image.src)}
                alt={image.altText || `Illustration for ${title}`}
                className="programme-img"
            />
        </a>}
        <CardBody className="d-flex flex-column p-5 pt-4">
            <h4>{title}</h4>
            {value && <CardText className="mt-2">
                <Markup trusted-markup-encoding="markdown">
                    {value}
                </Markup>
            </CardText>}
            {children && <CardText className="mt-2 mb-2">
                <IsaacContentValueOrChildren>
                    {children}
                </IsaacContentValueOrChildren>
            </CardText>}
            <div className="d-flex flex-column gap-1 mb-5">
                {programme.date && <div className="d-flex gap-2 align-items-center">
                    <i className="icon icon-md icon-events"/>
                    <span>{programme.date}</span>
                </div>}
                {programme.applicableTo && <div className="d-flex gap-2 align-items-center">
                    <i className="icon icon-md icon-person"/>
                    <span>{programme.applicableTo}</span>
                </div>}
                {programme.location && <div className="d-flex gap-2 align-items-center">
                    <i className="icon icon-md icon-location"/>
                    <span>{programme.location}</span>
                </div>}
            </div>
            <Spacer/>
            <CardText>
                <Link aria-label={`${title} read more`} className="focus-target btn btn-keyline" to={`${url}`}>
                    Read more
                </Link>
            </CardText>
        </CardBody>
    </Card>;
};
