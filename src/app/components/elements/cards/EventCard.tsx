import React from "react";
import * as RS from "reactstrap";
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
  } = event;

  return (
    <RS.Card
      data-testid="event-card"
      className={classnames("card-neat", {
        "disabled text-muted": hasExpired || isCancelled,
        "m-4": pod,
        "mb-4": !pod,
      })}
    >
      {eventThumbnail && (
        <div className={"event-card-image text-center"}>
          <RS.CardImg
            data-testid="event-card-image"
            aria-hidden={true}
            top
            src={eventThumbnail.src}
            alt={"" /* Decorative image, should be hidden from screenreaders */}
          />
        </div>
      )}
      <RS.CardBody className="d-flex flex-column">
        {title && (
          <RS.CardTitle tag="h3" data-testid="event-card-title">
            {title}
            {isCancelled ? (
              <RS.Badge color={"danger"} className="ml-1">
                Cancelled
              </RS.Badge>
            ) : (
              eventStatus !== "WAITING_LIST_ONLY" && placesAvailable == 0 && <RS.Badge className="ml-1">Full</RS.Badge>
            )}
            {isPrivateEvent && (
              <RS.Row className="mx-0 mt-2">
                <RS.Badge color="primary">Private Event</RS.Badge>
              </RS.Row>
            )}
          </RS.CardTitle>
        )}
        {subtitle && (
          <RS.CardText className="m-0 my-auto card-date-time" data-testid="event-card-subtitle">
            {subtitle}
          </RS.CardText>
        )}
        <RS.CardText className="m-0 my-auto card-date-time">
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
        </RS.CardText>
        <RS.CardText className="d-flex" data-testid="event-card-details">
          <Link className="focus-target" to={`/events/${id}`}>
            View details
            <span className="sr-only">
              {" "}
              of the event: {title} {" - "} <DateString>{date}</DateString>
            </span>
          </Link>
        </RS.CardText>
      </RS.CardBody>
    </RS.Card>
  );
};
