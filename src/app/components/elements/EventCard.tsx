import {Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import React from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {ImageDTO, IsaacEventPageDTO} from "../../../IsaacApiTypes";

interface EventCardProps {
    event?: IsaacEventPageDTO;
    eventImage?: ImageDTO;
    eventTitle?: string;
    eventSubtitle?: string;
    eventStartDate?: string;
    eventEndDate?: string;
    eventLocation?: string;
    eventUrl?: string;
    pastEvent?: boolean;
}

export const EventCard = (props: EventCardProps) => {
    return <Card className={classnames({'card-neat m-4': true, 'disabled text-muted': props.pastEvent})}>
        {props.eventImage && <div className='card-image text-center mt-3'>
            <CardImg
                className='m-auto rounded-circle' top
                src={props.eventImage.src} alt={props.eventImage.altText || `Illustration for ${props.eventTitle}`}
            />
        </div>}
        <CardBody className="d-flex flex-column">
            {props.eventTitle && <CardTitle tag="h3">{props.eventTitle}</CardTitle>}
            {props.eventSubtitle && <CardText className='m-0 my-auto card-date-time'>{props.eventSubtitle}</CardText>}
            <CardText className="m-0 my-auto card-date-time">
                <span className="d-block my-2">
                    <span className="font-weight-bold">When:</span> {" "} {props.eventStartDate}
                </span>
                <span className='d-block my-2'>
                    {props.eventEndDate}
                </span>
                {props.eventLocation && <span className='d-block my-2'>
                    <span className="font-weight-bold">Location:</span> {" "} {props.eventLocation}
                </span>}
            </CardText>
            <CardText>
                {props.eventUrl && <a className="focus-target" href={props.eventUrl} target="_blank" rel="noopener noreferrer">
                    View details
                    <span className='sr-only'> of the event: {props.eventTitle} {" - "} {props.eventStartDate}</span>
                </a>}
                {!props.eventUrl && <h1>TODO Generated local event url</h1>}
            </CardText>
        </CardBody>
    </Card>
};
