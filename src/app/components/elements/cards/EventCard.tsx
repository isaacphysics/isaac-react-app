import React from "react";
import classnames from "classnames";
import {Link} from "react-router-dom";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import {DateString} from "../DateString";
import {formatEventCardDate, isPhy, siteSpecific} from "../../../services";
import { Card, CardImg, CardBody, CardTitle, Badge, CardText } from "reactstrap";

export const EventCard = ({event, pod = false}: {event: AugmentedEvent; pod?: boolean}) => {
    const {id, title, subtitle, eventThumbnail, location, hasExpired, date, numberOfPlaces, eventStatus, isCancelled, userBookingStatus}
        = event;

    const isVirtualEvent = event.tags?.includes("virtual");
    const isTeacherEvent = event.tags?.includes("teacher");
    const isStudentEvent = event.tags?.includes("student");

    return <Card data-testid="event-card" className={classnames("card-neat", {'disabled text-muted': hasExpired || isCancelled, 'm-4': pod, 'mb-4': !pod})}>
        {eventThumbnail && <div className={'event-card-image text-center'}>
            <CardImg aria-hidden={true} top src={eventThumbnail.src} alt={"" /* Decorative image, should be hidden from screenreaders */} />
            {
                isPhy && (hasExpired ? <div className={"event-card-image-banner disabled"}>This event has expired</div> :
                    ((isVirtualEvent || isTeacherEvent || isStudentEvent) &&
                        <div className={"event-card-image-banner"}>
                            {isTeacherEvent && "Teacher "}
                            {isStudentEvent && `${isTeacherEvent ? " and" : ""} Student `}
                            event
                            {isVirtualEvent && " (Virtual)"}
                        </div>))
            }
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
                {isPhy && <div className="event-card-icons">
                    {isTeacherEvent && <img src="/assets/phy/icons/key_stage_sprite.svg#teacher-hat" alt="Teacher event" title="Teacher event"/>}
                    {isStudentEvent && <img src="/assets/phy/icons/teacher_features_sprite.svg#groups" alt="Student event" title="Student event"/>}
                    {isVirtualEvent && <img src="/assets/phy/icons/computer.svg" alt="Virtual event" title="Virtual event"/>}
                </div>}
            </CardText>
        </CardBody>
    </Card>;
};
