import React from "react";
import { Badge, Button, Card, CardBody, CardImg, CardText, CardTitle, Row } from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { AugmentedEvent } from "../../../../IsaacAppTypes";
import { DateString } from "../DateString";
import { formatEventCardDate } from "../../../services";

export const EventCard = ({ event, pod = false }: { event: AugmentedEvent; pod?: boolean }) => {
  const {
    id,
    title,
    subtitle,
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

  return (
    <Card
      data-testid="event-card"
      className={classnames("card-neat", {
        "disabled text-muted": hasExpired || isCancelled,
        "m-4": pod,
        "mb-4": !pod,
      })}
    >
      {eventThumbnail && (
        <div className={"event-card-image text-center"}>
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
          <CardTitle tag="h3" data-testid="event-card-title">
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
            {subtitle}
          </CardText>
        )}
        <CardText className="m-0 my-auto card-date-time">
          {date && endDate && (
            <span className="d-block my-2">
              <span className="font-weight-bold">When:</span>
              <span className="d-block" data-testid="event-card-date">
                {formatEventCardDate(event, pod)}
              </span>
            </span>
          )}
          {(location?.address?.addressLine1 || event.isVirtual) && (
            <span className="d-block my-2" data-testid="event-card-location">
              <span className="font-weight-bold">Location:</span>{" "}
              {event.isVirtual ? (
                <span>Online</span>
              ) : (
                <span>
                  {location?.address?.addressLine1}
                  {location?.address?.town && `, ${location.address.town}`}
                </span>
              )}
            </span>
          )}
        </CardText>
        <CardText className="d-flex" data-testid="event-card-details">
          <Link className="focus-target" to={`/events/${id}`}>
            View details
            <span className="sr-only">
              {" "}
              of the event: {title} {" - "} <DateString>{date}</DateString>
            </span>
          </Link>
        </CardText>
        {userBookingStatus === "CONFIRMED" && meetingUrl && (
          <a href={event.meetingUrl} className="w-100" target="_blank" rel="noopener noreferrer">
            <div className="d-flex justify-content-center w-100">
              <Button color="secondary" className="mt-2">
                Join event now
              </Button>
            </div>
          </a>
        )}
      </CardBody>
    </Card>
  );
};
