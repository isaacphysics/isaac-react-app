import { AppState, clearEventOverviews, getEventOverviews, useAppDispatch, useAppSelector } from "../../../state";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { Accordion } from "../Accordion";
import { ShowLoading } from "../../handlers/ShowLoading";
import { Link } from "react-router-dom";
import { DateString } from "../DateString";
import { atLeastOne, isEventLeader, sortOnPredicateAndReverse, zeroOrLess } from "../../../services";
import { EventOverview, PotentialUser } from "../../../../IsaacAppTypes";
import { Badge, Button, Input, Label, Table } from "reactstrap";

export enum EventOverviewFilter {
  "All events" = "ALL",
  "Upcoming events" = "FUTURE",
  "Recent events" = "RECENT",
  "Past events" = "PAST",
}

export function eventAttendancePercentage(numberAttended: number, numberAbsent: number) {
  const percentage = (numberAttended / (numberAttended + numberAbsent)) * 100;
  if (isNaN(percentage)) return "-";
  else if (percentage % 1 === 0) return percentage.toFixed(0) + "%";
  else {
    const roundedPercentage = Math.floor(percentage * 10) / 10;
    return roundedPercentage.toFixed(1) + "%";
  }
}

const EventTableRow = ({ eventData, onClick }: { eventData: EventOverview; onClick: (eventId: string) => void }) => {
  const {
    id,
    subtitle,
    date,
    bookingDeadline,
    location,
    eventStatus,
    numberOfConfirmedBookings,
    numberOfWaitingListBookings,
    numberAttended,
    numberAbsent,
    numberOfPlaces,
    privateEvent,
  } = eventData;

  return (
    <tr>
      <td>
        <Button color="secondary" className="btn-sm" onClick={() => onClick(id as string)}>
          Manage
        </Button>
      </td>
      <td className="text-left">
        <Link to={`/events/${id}`} target="_blank">
          {eventData.title} - {subtitle}
        </Link>
      </td>
      <td>
        <DateString>{date}</DateString>
      </td>
      <td>
        <DateString>{bookingDeadline}</DateString>
      </td>
      <td>{location?.address?.town}</td>
      <td style={{ width: "95px" }}>
        {privateEvent && <Badge color="primary">Private Event</Badge>}
        {eventStatus?.replace(/_/g, " ")}
      </td>
      <td>
        {numberOfConfirmedBookings} / {numberOfPlaces}
      </td>
      <td>{numberOfWaitingListBookings}</td>
      <td>{numberAttended}</td>
      <td>{numberAbsent}</td>
      <td>{eventAttendancePercentage(numberAttended, numberAbsent)}</td>
    </tr>
  );
};

export const EventOverviews = ({
  setSelectedEventId,
  user,
}: {
  user: PotentialUser;
  setSelectedEventId: (eventId: string | null) => void;
}) => {
  const dispatch = useAppDispatch();
  const eventOverviews = useAppSelector((state: AppState) => state && state.eventOverviews);

  const [overviewFilter, setOverviewFilter] = useState(EventOverviewFilter["Upcoming events"]);
  const [sortPredicate, setSortPredicate] = useState("date");
  const [reverse, setReverse] = useState(true);

  const numberOfLoadedEvents = eventOverviews ? eventOverviews.eventOverviews.length : 0;

  useEffect(() => {
    const startIndex = 0;
    setSelectedEventId(null);
    dispatch(clearEventOverviews);
    dispatch(getEventOverviews(overviewFilter, startIndex));
  }, [dispatch, setSelectedEventId, overviewFilter]);

  const EventTableButton = ({ sort, children }: PropsWithChildren<{ sort: string }>) => {
    return (
      <th>
        <Button
          color="link"
          onClick={() => {
            setSortPredicate(sort);
            setReverse(!reverse);
          }}
          style={{ wordWrap: "normal", minWidth: "80px" }}
        >
          {children}
        </Button>
      </th>
    );
  };

  const eventTableHeaderButtons = [
    { sort: "date", text: "Date" },
    { sort: "bookingDeadline", text: "Booking deadline" },
    { sort: "location.address.town", text: "Location" },
    { sort: "eventStatus", text: "Status" },
    { sort: "numberOfConfirmedBookings", text: "Number confirmed" },
    { sort: "numberOfWaitingListBookings", text: "Number waiting" },
    { sort: "numberAttended", text: "Number attended" },
    { sort: "numberAbsent", text: "Number absent" },
  ];

  return (
    <Accordion trustedTitle="Events overview" index={0}>
      {isEventLeader(user) && (
        <div className="bg-grey p-2 mb-4 text-center">
          As an event leader, you are only able to see the details of events which you manage.
        </div>
      )}
      <div className="clearfix">
        <div className="float-right mb-4">
          <Label>
            <Input
              type="select"
              value={overviewFilter}
              onChange={(e) => {
                setOverviewFilter(e.target.value as EventOverviewFilter);
              }}
            >
              {Object.entries(EventOverviewFilter).map(([filterLabel, filterValue]) => (
                <option key={filterValue} value={filterValue}>
                  {filterLabel}
                </option>
              ))}
            </Input>
          </Label>
        </div>
      </div>

      <ShowLoading
        until={eventOverviews}
        thenRender={({ eventOverviews, total }) => (
          <React.Fragment>
            {atLeastOne(eventOverviews.length) && (
              <div className="overflow-auto">
                <Table bordered className="mb-0 bg-white table-hover table-sm" style={{ maxWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: "80px" }}>Actions</th>
                      <th style={{ minWidth: "150px" }}>
                        <Button
                          color="link"
                          onClick={() => {
                            setSortPredicate("title");
                            setReverse(!reverse);
                          }}
                        >
                          Title
                        </Button>
                      </th>
                      {eventTableHeaderButtons.map((button) => (
                        <EventTableButton key={button.text} sort={button.sort}>
                          {button.text}
                        </EventTableButton>
                      ))}
                      <th style={{ minWidth: "80p§x" }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventOverviews.sort(sortOnPredicateAndReverse(sortPredicate, reverse)).map((eventData) => (
                      <EventTableRow key={eventData.id} eventData={eventData} onClick={setSelectedEventId} />
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Load More Button */}
            {numberOfLoadedEvents < total && (
              <div className="text-center mt-4">
                <Button
                  onClick={() => {
                    const startIndex = numberOfLoadedEvents;
                    dispatch(getEventOverviews(overviewFilter, startIndex));
                  }}
                >
                  Load more
                </Button>
              </div>
            )}
            {zeroOrLess(eventOverviews.length) && (
              <p className="text-center">
                <strong>No events to display with this filter setting</strong>
              </p>
            )}
          </React.Fragment>
        )}
      />
    </Accordion>
  );
};
