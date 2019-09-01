import React from "react";
import * as RS from "reactstrap";
import classnames from "classnames";
import {AugmentedEvent} from "../../../IsaacAppTypes";
import {DateString} from "./DateString";
import {Link} from "react-router-dom";

export const EventCard = ({event}: {event: AugmentedEvent}) => {
    const {id, title, subtitle, eventThumbnail, location, expired, date, endDate} = event;

    return <RS.Card className={classnames({'card-neat mb-4': true, 'disabled text-muted': expired})}>
        {eventThumbnail && <div className='card-image text-center mt-3'>
            <RS.CardImg
                className='m-auto rounded-circle' top
                src={eventThumbnail.src} alt={eventThumbnail.altText || `Illustration for ${title}`}
            />
        </div>}
        <RS.CardBody className="d-flex flex-column">
            {title && <RS.CardTitle tag="h3">{title}</RS.CardTitle>}
            {subtitle && <RS.CardText className='m-0 my-auto card-date-time'>{subtitle}</RS.CardText>}
            <RS.CardText className="m-0 my-auto card-date-time">
                <span className="d-block my-2">
                    <span className="font-weight-bold">When:</span> {" "}
                    <DateString>{date}</DateString>
                </span>
                <span className='d-block my-2'>
                    <DateString>{endDate}</DateString>
                </span>
                {location && location.address && <span className='d-block my-2'>
                    <span className="font-weight-bold">Location:</span> {" "}
                    {!event.virtual ?
                        <span>{location.address.addressLine1}{location.address.town && `, ${location.address.town}`}</span> :
                        <span>Online</span>
                    }
                </span>}
            </RS.CardText>
            <RS.CardText>
                <Link className="focus-target" to={`events/${id}`}>
                    View details
                    <span className='sr-only'> of the event: {title} {" - "} <DateString>{date}</DateString></span>
                </Link>
            </RS.CardText>
        </RS.CardBody>
    </RS.Card>
};
