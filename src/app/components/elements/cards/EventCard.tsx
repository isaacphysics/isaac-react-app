import React from "react";
import * as RS from "reactstrap";
import classnames from "classnames";
import {Link} from "react-router-dom";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import {DateString} from "../DateString";
import {formatEventCardDate, isPhy, siteSpecific} from "../../../services";

export const EventCard = ({event, pod = false}: {event: AugmentedEvent; pod?: boolean}) => {
    const {id, title, subtitle, eventThumbnail, location, hasExpired, date, numberOfPlaces, eventStatus, isCancelled, userBookingStatus}
        = event;

    const isVirtualEvent = event.tags?.includes("virtual");
    const isTeacherEvent = event.tags?.includes("teacher");
    const isStudentEvent = event.tags?.includes("student");

    return <RS.Card data-testid="event-card" className={classnames("card-neat", {'disabled text-muted': hasExpired || isCancelled, 'm-4': pod, 'mb-4': !pod})}>
        {eventThumbnail && <div className={'event-card-image text-center'}>
            <RS.CardImg aria-hidden={true} top src={eventThumbnail.src} alt={"" /* Decorative image, should be hidden from screenreaders */} />
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
        <RS.CardBody className="d-flex flex-column">
            {title && <RS.CardTitle tag="h3">
                {title}
                <div>
                    {userBookingStatus === "CONFIRMED" && <>{" "}<RS.Badge color={siteSpecific("success", "perfect")} outline>Booked</RS.Badge></>}
                    {userBookingStatus === "WAITING_LIST" && <>{" "}<RS.Badge color={siteSpecific("warning", "in-progress")} outline>On waiting list</RS.Badge></>}
                    {userBookingStatus === "RESERVED" && <>{" "}<RS.Badge color={siteSpecific("warning", "in-progress")} outline>Reserved</RS.Badge></>}
                    {isCancelled
                        ? <>{" "}<RS.Badge color={siteSpecific("danger", "failed")}>Cancelled</RS.Badge></>
                        : eventStatus !== "WAITING_LIST_ONLY" && numberOfPlaces == 0 && <>{" "}<RS.Badge>Full</RS.Badge></>
                    }
                </div>
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
                    <span className='visually-hidden'> of the event: {title} {" - "} <DateString>{date}</DateString></span>
                </Link>
                {isPhy && <div className="event-card-icons">
                    {isTeacherEvent && <img src="/assets/phy/icons/key_stage_sprite.svg#teacher-hat" alt="Teacher event" title="Teacher event"/>}
                    {isStudentEvent && <img src="/assets/phy/icons/teacher_features_sprite.svg#groups" alt="Student event" title="Student event"/>}
                    {isVirtualEvent && <img src="/assets/phy/icons/computer.svg" alt="Virtual event" title="Virtual event"/>}
                </div>}
            </RS.CardText>
        </RS.CardBody>
    </RS.Card>
};
