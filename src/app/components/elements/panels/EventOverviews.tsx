import { AppState, getEventOverviews, useAppDispatch, useAppSelector } from "../../../state";
import React, { useEffect, useState } from "react";
import { Accordion } from "../Accordion";
import * as RS from "reactstrap";
import { ShowLoading } from "../../handlers/ShowLoading";
import { Link } from "react-router-dom";
import { DateString } from "../DateString";
import { atLeastOne, isEventLeader, sortOnPredicateAndReverse, zeroOrLess } from "../../../services";
import { EventOverview, PotentialUser } from "../../../../IsaacAppTypes";

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
  } = eventData;

  return (
    <tr>
      <td className="align-middle">
        <RS.Button color="secondary" className="btn-sm mx-2" onClick={() => onClick(id as string)}>
          Manage
        </RS.Button>
      </td>
      <td className="align-middle small">
        <Link to={`/events/${id}`} target="_blank">
          {eventData.title} - {subtitle}
        </Link>
      </td>
      <td className="small-centered-td">
        <DateString>{date}</DateString>
      </td>
      <td className="small-centered-td">
        <DateString>{bookingDeadline}</DateString>
      </td>
      <td className="small-centered-td">{location && location.address && location.address.town}</td>
      <td className="small-centered-td">{eventStatus?.replace(/_/g, " ")}</td>
      <td className="small-centered-td">
        {numberOfConfirmedBookings} / {numberOfPlaces}
      </td>
      <td className="small-centered-td">{numberOfWaitingListBookings}</td>
      <td className="small-centered-td">{numberAttended}</td>
      <td className="small-centered-td">{numberAbsent}</td>
      <td className="small-centered-td">{eventAttendancePercentage(numberAttended, numberAbsent)}</td>
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
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    setSelectedEventId(null);
    dispatch(getEventOverviews(overviewFilter));
  }, [dispatch, setSelectedEventId, overviewFilter]);

  const EventTableButton = ({ sort, text }: { sort: string; text: string }) => {
    return (
      <th className="align-middle">
        <RS.Button
          color="link"
          onClick={() => {
            setSortPredicate(sort);
            setReverse(!reverse);
          }}
          style={{ wordWrap: "normal", minWidth: "80px" }}
        >
          {text}
        </RS.Button>
      </th>
    );
  };

  const eventTableHeaderButtons = [
    { sort: "title", text: "Title" },
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
        {/* temporary removal during handover to STEM */}
        {/* <div className="mb-3 float-left">
                <RS.Button color="primary" size="sm" tag={Link} to="/events_toolkit">Events toolkit</RS.Button>
            </div> */}
        <div className="float-right mb-4">
          <RS.Label>
            <RS.Input
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
            </RS.Input>
          </RS.Label>
        </div>
      </div>

      <ShowLoading
        until={eventOverviews}
        thenRender={(eventOverviews) => (
          <React.Fragment>
            {atLeastOne(eventOverviews.length) && (
              <div className="overflow-auto">
                <RS.Table bordered className="mb-0 bg-white table-hover table-sm" style={{ maxWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th className="align-middle text-center" style={{ minWidth: "80px" }}>
                        Actions
                      </th>
                      {eventTableHeaderButtons.map((button) => (
                        <EventTableButton key={button.text} sort={button.sort} text={button.text} />
                      ))}
                      <th className="align-middle text-center" style={{ minWidth: "80px" }}>
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventOverviews.sort(sortOnPredicateAndReverse(sortPredicate, reverse)).map((eventData) => (
                      <EventTableRow key={eventData.id} eventData={eventData} onClick={setSelectedEventId} />
                    ))}
                  </tbody>
                </RS.Table>
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
