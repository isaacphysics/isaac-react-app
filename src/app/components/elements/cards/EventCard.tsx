import React from "react";
import classnames from "classnames";
import {Link} from "react-router-dom";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import {DateString, formatDate, FRIENDLY_DATE_AND_TIME} from "../DateString";
import {formatEventCardDate, formatEventCardDateSlim, getThemeFromTags, siteSpecific} from "../../../services";
import { Card, CardImg, CardBody, CardTitle, Badge, CardText, CardProps } from "reactstrap";
import { Spacer } from "../Spacer";
import classNames from "classnames";
import { AdaCard } from "./AdaCard";

const IconText = ({icon, children}: {icon: string, children: React.ReactNode}) => {
    return <div className="d-inline-flex">
        <i className={classNames("icon icon-md me-2", icon)} aria-hidden="true" />
        <span>{children}</span>
    </div>;
};

const PhysicsCardContents = ({event}: {event: AugmentedEvent}) => {
    const {location} = event;
    return <>
        <IconText icon="icon-events">
            <span>{formatEventCardDateSlim(event)}</span>
        </IconText>
        {location && location.address && <IconText icon="icon-location">
            {!event.isVirtual ? <>{location.address.addressLine1}{location.address.town && `, ${location.address.town}`}</> : "Online"}
        </IconText>}
        {event.userBookingStatus === "CONFIRMED"
            ? <IconText icon="icon-tick">You are booked on this event.</IconText>
            : event.userBookingStatus === "RESERVED"
                ? <IconText icon="icon-tick">You have a reservation for this event.</IconText>
                : event.userBookingStatus === "WAITING_LIST"
                    ? <IconText icon="icon-tick">You are on the waiting list for this event.</IconText>
                    : event.hasExpired 
                        ? <IconText icon="icon-cross">Event has expired</IconText> 
                        : event.isWithinBookingDeadline 
                            ? <IconText icon="icon-tick">Available to book</IconText>
                            : <IconText icon="icon-cross">Booking closed</IconText>
        }
    </>;
};

export const PhysicsEventCard = ({event, layout, ...rest}: {event: AugmentedEvent, layout?: "landing-page"} & CardProps) => {
    const {id, title, subtitle, eventThumbnail, date, hasExpired} = event;

    const isVirtualEvent = event.tags?.includes("virtual");
    const isTeacherEvent = event.tags?.includes("teacher") && !event.tags?.includes("student");
    const isStudentEvent = event.tags?.includes("student") && !event.tags?.includes("teacher");

    const subject = getThemeFromTags(event.tags) !== "neutral" ? getThemeFromTags(event.tags) : "physics";

    return <Card {...rest} className={classNames("pod", rest.className, {"pod-clickable": layout === "landing-page"})} data-bs-theme={subject}>
        {eventThumbnail &&
            <Link className={classNames("pod-img event-pod-img d-flex", {"expired": hasExpired})} to={`/events/${id}`}>
                <CardImg aria-hidden={true} top src={eventThumbnail.src} alt={""} aria-labelledby={`event-title-${id}`} />
                {hasExpired &&
                    <div className="event-pod-badge">
                        <Badge className="badge rounded-pill">EXPIRED</Badge>
                    </div>}
                {isVirtualEvent &&
                    <div className="event-pod-badge align-self-end">
                        <Badge className="badge rounded-pill" color="primary">ONLINE</Badge>
                    </div>}
                {isTeacherEvent &&
                    <div className="event-pod-hex">
                        <b>TEACHER EVENT</b>
                        <img src="/assets/phy/icons/redesign/teacher-event-hex.svg" alt={"teacher event icon"}/>
                    </div>}
                {isStudentEvent &&
                    <div className="event-pod-hex">
                        <b>STUDENT EVENT</b>
                        <img src="/assets/phy/icons/redesign/student-event-hex.svg" alt={"student event icon"}/>
                    </div>}
            </Link>}
        <CardBody className="d-flex flex-column">
            {title && <CardTitle className="mb-0 pod-title" id={`event-title-${id}`}><h5>{title}</h5></CardTitle>}
            {subtitle && <CardText className="mb-2 fixed-height">
                {subtitle}
            </CardText>}
            <Spacer/>
            <CardText tag="div" className="d-flex flex-column gap-2 mt-2 mb-3">
                <PhysicsCardContents event={event} />
            </CardText>
            {layout !== "landing-page" && <CardText>
                <Link aria-label={`${title} read more`} className="focus-target btn btn-keyline" to={`/events/${id}`}>
                    Read more
                    <span className='visually-hidden'> of the event: {title} {" - "} <DateString>{date}</DateString></span>
                </Link>
            </CardText>}
        </CardBody>
    </Card>;
};

const AdaEventCard = ({event, pod = false}: {event: AugmentedEvent; pod?: boolean}) => {
    const {id, title, subtitle, eventThumbnail, location, hasExpired, date, numberOfPlaces, eventStatus, isCancelled, userBookingStatus}
        = event;

    return <AdaCard card={{
        title: title || "Untitled event",
        image: {src: eventThumbnail?.src ?? ""},
        buttonText: "View details",
        buttonAltText: `View details of the event: ${title} - ${formatDate(date, FRIENDLY_DATE_AND_TIME)}`,
        clickUrl: `/events/${id}`,
        className: classnames({'disabled text-muted': hasExpired || isCancelled}),
    }} className="h-100">
        <div>
            {userBookingStatus === "CONFIRMED" && <>{" "}<Badge color="perfect" outline>Booked</Badge></>}
            {userBookingStatus === "WAITING_LIST" && <>{" "}<Badge color="in-progress" outline>On waiting list</Badge></>}
            {userBookingStatus === "RESERVED" && <>{" "}<Badge color="in-progress" outline>Reserved</Badge></>}
            {isCancelled
                ? <>{" "}<Badge color="failed">Cancelled</Badge></>
                : eventStatus !== "WAITING_LIST_ONLY" && numberOfPlaces == 0 && <>{" "}<Badge>Full</Badge></>
            }
        </div>
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
    </AdaCard>;
};

export const EventCard = siteSpecific(PhysicsEventCard, AdaEventCard);
