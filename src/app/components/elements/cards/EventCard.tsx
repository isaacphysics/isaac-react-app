import {Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import React from "react";
import {connect} from "react-redux";
import classnames from "classnames";

interface EventCardProps {
    eventImage: string;
    eventTitle: string;
    eventSubtitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventUrl: string;
    pastEvent?: boolean;
}

const EventCardComponent = function (props: EventCardProps) {
    return <Card className={classnames({'card-neat m-4': true, 'disabled text-muted': props.pastEvent})}>
        <div className='card-image text-center mt-3'>
            <CardImg
                className='m-auto rounded-circle'
                top
                src={props.eventImage}
                alt={`Illustration for ${props.eventTitle}`}
            />
        </div>
        <CardBody className="d-flex flex-column">
            <CardTitle tag="h3">{props.eventTitle}</CardTitle>
            <CardText className='m-0 my-auto card-date-time'>
                {props.eventSubtitle}
            </CardText>
            <CardText className="m-0 my-auto card-date-time">
                <span className="d-block my-2">
                    <span className="font-weight-bold">When:</span> {" "} {props.eventDate}
                </span>
                <span className='d-block my-2'>
                    {props.eventTime}
                </span>
                <span className='d-block my-2'>
                    <span className="font-weight-bold">Location:</span> {" "} {props.eventLocation}
                </span>
            </CardText>
            <CardText>
                <a className="focus-target" href={props.eventUrl} target="_blank" rel="noopener noreferrer">
                    View details
                    <span className='sr-only'> of the event: {props.eventTitle} {" - "} {props.eventDate}</span>
                </a>
            </CardText>
        </CardBody>
    </Card>
};

export const EventCard = connect()(EventCardComponent);
