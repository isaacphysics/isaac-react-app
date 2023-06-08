import React from "react";
import * as RS from "reactstrap";
import classnames from "classnames";
import {Link} from "react-router-dom";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import {DateString} from "../DateString";
import {formatEventCardDate} from "../../../services";

export const EventCard = ({event, pod = false}: {event: AugmentedEvent; pod?: boolean}) => {
    const {id, title, subtitle, eventThumbnail, location, hasExpired, date, numberOfPlaces, eventStatus, isCancelled} = event;

    return <RS.Card className={classnames("card-neat", {'disabled text-muted': hasExpired || isCancelled, 'm-4': pod, 'mb-4': !pod})}>
        {eventThumbnail && <div className={'event-card-image text-center'}>
            <RS.CardImg aria-hidden={true} top src={eventThumbnail.src} alt={"" /* Decorative image, should be hidden from screenreaders */} />
        </div>}
        <RS.CardBody className="d-flex flex-column">
            {title && <RS.CardTitle tag="h3">
                {title}
                {isCancelled
                    ? <>{"  "}<RS.Badge color={"danger"}>Cancelled</RS.Badge></>
                    : eventStatus !== "WAITING_LIST_ONLY" && numberOfPlaces == 0 && <>{"  "}<RS.Badge>Full</RS.Badge></>
                }
            </RS.CardTitle>}
            {subtitle && <RS.CardText className='m-0 my-auto card-date-time'>{subtitle}</RS.CardText>}
            <RS.CardText className="m-0 my-auto card-date-time">
                <span className="d-block my-2">
                    <span className="font-weight-bold">When:</span>
                    <span className="d-block">
                        {formatEventCardDate(event, pod)}
                    </span>
                </span>
                {location && location.address && <span className='d-block my-2'>
                    <span className="font-weight-bold">Location:</span> {" "}
                    {!event.isVirtual ?
                        <span>{location.address.addressLine1}{location.address.town && `, ${location.address.town}`}</span> :
                        <span>Online</span>
                    }
                </span>}
            </RS.CardText>
            <RS.CardText className="d-flex">
                <Link className="focus-target" to={`/events/${id}`}>
                    View details
                    <span className='sr-only'> of the event: {title} {" - "} <DateString>{date}</DateString></span>
                </Link>
            </RS.CardText>
        </RS.CardBody>
    </RS.Card>
};
