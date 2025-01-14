import React from "react";
import {Link} from "react-router-dom";
import {AugmentedEvent} from "../../../IsaacAppTypes";
import {DateString} from "./DateString";
import {formatEventCardDate} from "../../services";
import { Card, CardImg, CardBody, CardTitle, Badge, CardText } from "reactstrap";

export const EventPod = ({event}: {event: AugmentedEvent}) => {
    const {id, title, subtitle, eventThumbnail, location, date} = event;

    const isVirtualEvent = event.tags?.includes("virtual");
    const isTeacherEvent = event.tags?.includes("teacher") && !event.tags?.includes("student");
    const isStudentEvent = event.tags?.includes("student") && !event.tags?.includes("teacher");

    return <Card className="pod">
        {eventThumbnail &&
            <div className={"pod-img event-pod-img"}>
                <CardImg aria-hidden={true} top src={eventThumbnail.src} alt={"" /* Decorative image, should be hidden from screenreaders */} className="pod-img" />
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
            </div>}
        <CardBody>
            {title && 
                <CardTitle tag="b">
                    {title}
                </CardTitle>}
            {subtitle &&
                <CardText>
                    {subtitle}
                </CardText>}
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

export default EventPod;