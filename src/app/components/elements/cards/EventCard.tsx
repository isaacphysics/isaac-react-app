import React from "react";
import classnames from "classnames";
import {Link} from "react-router-dom";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import {DateString} from "../DateString";
import {formatEventCardDate, siteSpecific} from "../../../services";
import { Card, CardImg, CardBody, CardTitle, Badge, CardText, CardProps } from "reactstrap";
import { Spacer } from "../Spacer";
import classNames from "classnames";

export const PhysicsEventCard = ({event, ...rest}: {event: AugmentedEvent} & CardProps) => {
    const {id, title, subtitle, eventThumbnail, location, date} = event;

    const isVirtualEvent = event.tags?.includes("virtual");
    const isTeacherEvent = event.tags?.includes("teacher") && !event.tags?.includes("student");
    const isStudentEvent = event.tags?.includes("student") && !event.tags?.includes("teacher");

    return <Card {...rest} className={classNames("pod", rest.className)}>
        {eventThumbnail &&
            <a className={"pod-img event-pod-img"} href={`/events/${id}`}>
                <CardImg aria-hidden={true} top src={eventThumbnail.src} alt={"" /* Decorative image, should be hidden from screenreaders */} />
                {isVirtualEvent &&
                    <div className={"event-pod-badge"}>
                        <Badge className="badge rounded-pill" color="primary">ONLINE</Badge>
                    </div>}
                {isTeacherEvent &&
                    <div className={"event-pod-hex"}>
                        <b>TEACHER EVENT</b>
                        <img src="/assets/phy/icons/redesign/teacher-event-hex.svg" alt={"teacher event icon"}/>
                    </div>}
                {isStudentEvent &&
                    <div className={"event-pod-hex"}>
                        <b>STUDENT EVENT</b>
                        <img src="/assets/phy/icons/redesign/student-event-hex.svg" alt={"student event icon"}/>
                    </div>}
            </a>}
        <CardBody className="d-flex flex-column ps-0">
            {title && <CardTitle className="mb-0 pod-title">{title}</CardTitle>}
            <CardText className="mb-0">
                {subtitle && <p className="m-0">{subtitle}</p>}
            </CardText>
            <Spacer/>
            <div className="section-divider"/>
            <CardText>
                <b>When: </b>{formatEventCardDate(event)}
                {location && location.address &&
                    <span className='d-block my-1'>
                        <b>Location: </b>
                        {!event.isVirtual ? <>{location.address.addressLine1}{location.address.town && `, ${location.address.town}`}</> : "Online"}
                    </span>}
            </CardText>
            <CardText>
                <Link aria-label={`${title} read more`} className="focus-target btn btn-keyline" to={`/events/${id}`}>
                    Read more
                    <span className='visually-hidden'> of the event: {title} {" - "} <DateString>{date}</DateString></span>
                </Link>
            </CardText>
        </CardBody>
    </Card>;
};

const AdaEventCard = ({event, pod = false}: {event: AugmentedEvent; pod?: boolean}) => {
    const {id, title, subtitle, eventThumbnail, location, hasExpired, date, numberOfPlaces, eventStatus, isCancelled, userBookingStatus}
        = event;

    return <Card data-testid="event-card" className={classnames("card-neat", {'disabled text-muted': hasExpired || isCancelled, 'm-4': pod, 'mb-4': !pod})}>
        {eventThumbnail && <div className={'event-card-image text-center'}>
            <CardImg aria-hidden={true} top src={eventThumbnail.src} alt={"" /* Decorative image, should be hidden from screenreaders */} />
        </div>}
        <CardBody className="d-flex flex-column">
            {title && <CardTitle tag="h3">
                {title}
                <div>
                    {userBookingStatus === "CONFIRMED" && <>{" "}<Badge color={siteSpecific("success", "perfect")} outline>Booked</Badge></>}
                    {userBookingStatus === "WAITING_LIST" && <>{" "}<Badge color={siteSpecific("warning", "in-progress")} outline>On waiting list</Badge></>}
                    {userBookingStatus === "RESERVED" && <>{" "}<Badge color={siteSpecific("warning", "in-progress")} outline>Reserved</Badge></>}
                    {isCancelled
                        ? <>{" "}<Badge color={siteSpecific("danger", "failed")}>Cancelled</Badge></>
                        : eventStatus !== "WAITING_LIST_ONLY" && numberOfPlaces == 0 && <>{" "}<Badge>Full</Badge></>
                    }
                </div>
            </CardTitle>}
            {subtitle && <CardText className='m-0 my-auto card-date-time'>{subtitle}</CardText>}
            <CardText className="m-0 my-auto card-date-time">
                <span className="d-block my-2">
                    <span className="fw-bold">When:</span>
                    <span className="d-block">
                        {formatEventCardDate(event, pod)}
                    </span>
                </span>
                {location && location.address && <span className='d-block my-2'>
                    <span className="fw-bold">Location:</span> {" "}
                    {!event.isVirtual ?
                        <span>{location.address.addressLine1}{location.address.town && `, ${location.address.town}`}</span> :
                        <span>Online</span>
                    }
                </span>}
            </CardText>
            <CardText className="d-flex">
                <Link className="focus-target" to={`/events/${id}`}>
                    View details
                    <span className='visually-hidden'> of the event: {title} {" - "} <DateString>{date}</DateString></span>
                </Link>
            </CardText>
        </CardBody>
    </Card>;
};

export const EventCard = siteSpecific(PhysicsEventCard, AdaEventCard);
