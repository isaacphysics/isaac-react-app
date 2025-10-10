import React from "react";
import { Badge, Button, Card, CardBody, CardImg, CardText, CardTitle, Row } from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { AugmentedEvent } from "../../../../IsaacAppTypes";
import { DateString } from "../DateString";
import { formatEventCardDate } from "../../../services";
import ReactGA from "react-ga4";

export const EventCard = ({ event, pod = false }: { event: AugmentedEvent; pod?: boolean }) => {
  const {
    id,
    title,
    subtitle,
    audience,
    eventThumbnail,
    location,
    hasExpired,
    endDate,
    date,
    placesAvailable,
    eventStatus,
    isCancelled,
    isPrivateEvent,
    userBookingStatus,
    meetingUrl,
  } = event;

  const getCourseName = (audience: any[] | undefined) => {
    if (!audience?.length) return "N/A";

    const stages = new Set(audience.flatMap((aud) => aud.stage || []));
    const hasGcse = stages.has("gcse");
    const hasALevel = stages.has("a_level");

    if (hasGcse && hasALevel) return "GCSE/A level";
    if (hasGcse) return "GCSE";
    if (hasALevel) return "A level";
    return "GCSE/A level";
  };

  return (
    <Card
      data-testid="event-card"
      className={classnames("card-neat custom-card", {
        "disabled text-muted": hasExpired || isCancelled,
        "m-4": pod,
        "mb-4": !pod,
      })}
    >
      {eventThumbnail && (
        <div className={"event-card-image"}>
          <span className="course-name">{getCourseName(audience)}</span>
          <CardImg
            data-testid="event-card-image"
            aria-hidden={true}
            top
            src={eventThumbnail.src}
            alt={"" /* Decorative image, should be hidden from screenreaders */}
          />
        </div>
      )}
      <CardBody className="d-flex flex-column">
        {title && (
          <CardTitle tag="h3" data-testid="event-card-title" className="card-title">
            {title}
            {isCancelled ? (
              <Badge color={"danger"} className="ml-1">
                Cancelled
              </Badge>
            ) : (
              eventStatus !== "WAITING_LIST_ONLY" && placesAvailable == 0 && <Badge className="ml-1">Full</Badge>
            )}
            {isPrivateEvent && (
              <Row className="mx-0 mt-2">
                <Badge color="primary">Private Event</Badge>
              </Row>
            )}
          </CardTitle>
        )}
        {subtitle && (
          <CardText className="m-0 my-auto card-date-time" data-testid="event-card-subtitle">
            <span className="d-block my-2">
              <span className="card-sub-title">What</span>
              <span className="d-block">{subtitle}</span>
            </span>
          </CardText>
        )}
        <CardText className="m-0 my-auto card-date-time">
          {date && endDate && (
            <span className="d-block my-2">
              <span className="card-sub-title">When</span>
              <span className="d-block" data-testid="event-card-date">
                {formatEventCardDate(event, pod)}
              </span>
            </span>
          )}
          {(location?.address?.addressLine1 || event.isVirtual) && (
            <span className="d-block my-2" data-testid="event-card-location">
              <span className="card-sub-title">Where</span>
              <span className="d-block">
                {event.isVirtual ? (
                  <span>Online</span>
                ) : (
                  <span>
                    {location?.address?.addressLine1}
                    {location?.address?.town && `, ${location.address.town}`}
                  </span>
                )}
              </span>
            </span>
          )}
        </CardText>
        <CardText className="d-flex" data-testid="event-card-details">
          <Link className="details-button" to={`/events/${id}`}>
            View details
            <span className="sr-only">
              {" "}
              of the event: {title} {" - "} <DateString>{date}</DateString>
            </span>
          </Link>
        </CardText>
        {userBookingStatus === "CONFIRMED" && meetingUrl && (
          <CardText className="d-flex justify-content-center">
            <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
              <Button
                color="secondary"
                className="mt-2 w-100"
                onClick={() =>
                  ReactGA.event({
                    action: "join_event_button",
                    category: "Join Event Now",
                    label: "Event Card",
                  })
                }
              >
                Join event now
              </Button>
            </a>
          </CardText>
        )}
      </CardBody>
    </Card>
  );
};
