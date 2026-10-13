import React from "react";
import classnames from "classnames";
import {Link} from "react-router-dom";
import {AugmentedEvent, PodLayout} from "../../../../IsaacAppTypes";
import {DateString, formatDate, FRIENDLY_DATE_AND_TIME} from "../DateString";
import {formatEventCardDate, formatEventCardDateSlim, getThemeFromTags, siteSpecific} from "../../../services";
import { Card, CardImg, CardBody, CardTitle, Badge, CardText, CardProps } from "reactstrap";
import { Spacer } from "../Spacer";
import classNames from "classnames";
import { AdaCard } from "./AdaCard";
import { ContentPropertyTags } from "../ContentPropertyTags";
import { useTranslation } from "react-i18next";

const IconText = ({icon, children}: {icon: string, children: React.ReactNode}) => {
    return <div className="d-inline-flex">
        <i className={classNames("icon icon-md me-2", icon)} aria-hidden="true" />
        <span>{children}</span>
    </div>;
};

const PhysicsCardContents = ({event}: {event: AugmentedEvent}) => {
    const { t } = useTranslation();
    const {location} = event;
    return <>
        <IconText icon="icon-events">
            <span>{formatEventCardDateSlim(event)}</span>
        </IconText>
        {location && location.address && <IconText icon="icon-location">
            {!event.isVirtual ? <>{location.address.addressLine1}{location.address.town && `, ${location.address.town}`}</> : "Online"}
        </IconText>}
        {event.userBookingStatus === "CONFIRMED"
            ? <IconText icon="icon-tick">{t("common:events.card.bookedStatus")}</IconText>
            : event.userBookingStatus === "RESERVED"
                ? <IconText icon="icon-tick">{t("common:events.card.reservedStatus")}</IconText>
                : event.userBookingStatus === "WAITING_LIST"
                    ? <IconText icon="icon-tick">{t("common:events.card.waitingListStatus")}</IconText>
                    : event.hasExpired 
                        ? <IconText icon="icon-cross">{t("common:events.card.expired")}</IconText> 
                        : event.isWithinBookingDeadline 
                            ? <IconText icon="icon-tick">{t("common:events.card.availableToBook")}</IconText>
                            : <IconText icon="icon-cross">{t("common:events.card.bookingClosed")}</IconText>
        }
    </>;
};

export const PhysicsEventCard = ({event, layout, ...rest}: {event: AugmentedEvent, layout?: PodLayout} & CardProps) => {
    const { t } = useTranslation();
    const {id, title, subtitle, eventThumbnail, date, hasExpired} = event;

    const isVirtualEvent = event.tags?.includes("virtual");
    const isTeacherEvent = event.tags?.includes("teacher") && !event.tags?.includes("student");
    const isStudentEvent = event.tags?.includes("student") && !event.tags?.includes("teacher");
    const bookingDeadlineSoon = event.bookingDeadline && event.isWithinBookingDeadline && (new Date(event.bookingDeadline).getTime() - Date.now()) < 604800000; // 1 week
    const subject = getThemeFromTags(event.tags) !== "neutral" ? getThemeFromTags(event.tags) : "physics";

    return <Card {...rest} className={classNames("pod", rest.className, {"pod-flush": layout === "flush"})} data-bs-theme={subject}>
        {eventThumbnail &&
            <Link className={classNames("pod-img event-pod-img position-relative d-flex", {"expired": hasExpired})} to={`/events/${id}`}>
                <CardImg aria-hidden={true} top src={eventThumbnail.src} alt={""} aria-labelledby={`event-title-${id}`}/>
                <span className="event-pod-badges align-self-end">
                    {isVirtualEvent &&
                        <span>
                            <Badge className="badge rounded-pill" color="primary">{t("common:events.card.onlineBadge")}</Badge>
                        </span>
                    }
                    {hasExpired &&
                        <span className="expired-badge">
                            <Badge className="badge rounded-pill" color="failed">{t("common:events.card.expiredBadge")}</Badge>
                        </span>}
                    {bookingDeadlineSoon &&
                        <span>
                            <span className="warning-tag px-2 fw-semibold">
                                {t("common:events.card.bookingDeadlineSoon")}
                            </span>
                        </span>}
                </span>
                {isTeacherEvent &&
                    <div className="event-pod-hex">
                        <b>{t("common:events.card.teacherEvent")}</b>
                        <img src="/assets/phy/icons/redesign/teacher-event-hex.svg" alt={t("common:events.card.teacherEventIconAlt")}/>
                    </div>}
                {isStudentEvent &&
                    <div className="event-pod-hex">
                        <b>{t("common:events.card.studentEvent")}</b>
                        <img src="/assets/phy/icons/redesign/student-event-hex.svg" alt={t("common:events.card.studentEventIconAlt")}/>
                    </div>}
            </Link>}
        <CardBody className="d-flex flex-column">
            <CardTitle className="mb-0 pod-title d-flex align-items-baseline" id={`event-title-${id}`}>
                {title && <h3 className="mb-0 me-2 h5">{title}</h3>}
                <ContentPropertyTags tags={event.tags} />
            </CardTitle>
            {layout === "flush" && <div className="section-divider" />}
            {subtitle && <CardText className="mb-2 fixed-height">
                {subtitle}
            </CardText>}
            <Spacer/>
            <CardText tag="div" className="d-flex flex-column gap-2 mt-2 mb-3">
                <PhysicsCardContents event={event} />
            </CardText>
            {layout !== "flush" && <CardText>
                <Link aria-label={t("common:events.card.readMoreAriaLabel", { eventTitle: title })} className="focus-target btn btn-keyline" to={`/events/${id}`}>
                    Read more
                    <span className='visually-hidden'> of the event: {title} {" - "} <DateString>{date}</DateString></span>
                </Link>
            </CardText>}
        </CardBody>
    </Card>;
};

const AdaEventCard = ({event, pod = false}: {event: AugmentedEvent; pod?: boolean}) => {
    const { t } = useTranslation();
    const {id, title, subtitle, eventThumbnail, location, hasExpired, date, numberOfPlaces, eventStatus, isCancelled, userBookingStatus}
        = event;

    return <AdaCard card={{
        title: title || t("common:events.card.untitled"),
        image: {src: eventThumbnail?.src ?? ""},
        buttonText: t("common:events.card.viewDetailsButton"),
        buttonAltText: t("common:events.card.viewDetailsAriaLabel", { eventTitle: title, eventDate: formatDate(date, FRIENDLY_DATE_AND_TIME) }),
        clickUrl: `/events/${id}`,
        className: classnames({'disabled text-muted': hasExpired || isCancelled}),
    }} className="h-100">
        <div>
            {userBookingStatus === "CONFIRMED" && <>{" "}<Badge color="perfect" outline>{t("common:events.card.bookedBadge")}</Badge></>}
            {userBookingStatus === "WAITING_LIST" && <>{" "}<Badge color="in-progress" outline>{t("common:events.card.waitingListBadge")}</Badge></>}
            {userBookingStatus === "RESERVED" && <>{" "}<Badge color="in-progress" outline>{t("common:events.card.reservedBadge")}</Badge></>}
            {isCancelled
                ? <>{" "}<Badge color="failed">{t("common:events.card.cancelledBadge")}</Badge></>
                : eventStatus !== "WAITING_LIST_ONLY" && numberOfPlaces == 0 && <>{" "}<Badge>{t("common:events.card.fullBadge")}</Badge></>
            }
        </div>
        {subtitle && <CardText className='m-0 my-auto card-date-time'>{subtitle}</CardText>}
        <CardText className="m-0 my-auto card-date-time">
            <span className="d-block my-2">
                <span className="fw-bold">{t("common:events.card.whenLabel")}</span>
                <span className="d-block">
                    {formatEventCardDate(event, pod)}
                </span>
            </span>
            {location && location.address && <span className='d-block my-2'>
                <span className="fw-bold">{t("common:events.card.locationLabel")}</span> {" "}
                {!event.isVirtual ?
                    <span>{location.address.addressLine1}{location.address.town && `, ${location.address.town}`}</span> :
                    <span>{t("common:events.card.online")}</span>
                }
            </span>}
        </CardText>
    </AdaCard>;
};

export const EventCard = siteSpecific(PhysicsEventCard, AdaEventCard);
