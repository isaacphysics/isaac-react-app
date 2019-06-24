import {Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import React from "react";
import {connect} from "react-redux";

interface EventCardProps {
    eventImage: string;
    eventTitle: string;
    eventSubtitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventUrl: string;
}

const EventCardComponent = function (props: EventCardProps) {
    return <Card className='card-neat m-4'>
        <div className='card-image text-center mt-3'>
            <CardImg
                className='m-auto rounded-circle'
                top
                src={props.eventImage}
                alt="Teacher event illustration"
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
                <a href={props.eventUrl} target="_blank" rel="noopener noreferrer">
                    View Details
                    <span className='sr-only'> of the event: {props.eventTitle}</span>
                </a>
            </CardText>
        </CardBody>
    </Card>
};

export const EventCard = connect()(EventCardComponent);
