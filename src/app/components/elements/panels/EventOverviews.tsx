import {
    useLazyAdminGetEventOverviewsQuery
} from "../../../state";
import React, {useEffect, useState} from "react";
import {Accordion} from "../Accordion";
import {Link} from "react-router-dom";
import {DateString} from "../DateString";
import {atLeastOne, isAda, isEventLeader, siteSpecific, zeroOrLess} from "../../../services";
import {PotentialUser} from "../../../../IsaacAppTypes";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import orderBy from "lodash/orderBy";
import { Button, Label, Input, Table } from "reactstrap";

export enum EventOverviewFilter {
    "All events" = "ALL",
    "Upcoming events" = "FUTURE",
    "Recent events" = "RECENT",
    "Past events" = "PAST",
}
const EVENTS_PER_LOAD = 20;
export const EventOverviews = ({setSelectedEventId, user}: {user: PotentialUser; setSelectedEventId: (eventId: string | null) => void}) => {

    const [eventOverviewFilter, setEventOverviewFilter] = useState(EventOverviewFilter["Upcoming events"]);
    const [sortPredicate, setSortPredicate] = useState("date");
    const [reverse, setReverse] = useState(false);

    const [getEventOverviews, eventOverviewQuery] = useLazyAdminGetEventOverviewsQuery();
    const {data} = eventOverviewQuery;
    const {eventOverviews, total} = data ?? {};

    useEffect(() => {
        setSelectedEventId(null);
        getEventOverviews({startIndex: 0, limit: EVENTS_PER_LOAD, eventOverviewFilter});
    }, [setSelectedEventId, eventOverviewFilter]);

    // Reset the sort predicate when we load a new set of events
    useEffect(() => {
        if (total) {
            setSortPredicate("date");
            setReverse(false);
        }
    }, [total]);

    return <Accordion trustedTitle="Events overview" index={0} startOpen>
        {isEventLeader(user) && <div className="bg-grey p-2 mb-4 text-center">
            As an event leader, you are only able to see the details of events which you manage.
        </div>}
        <div className="clearfix">
            {isAda && <div className="mb-3 float-start">
                <Button color="primary" size="sm" tag={Link} to="/events_toolkit">Events toolkit</Button>
            </div>}
            <div className="float-start">
                {/* Load More Button */}
                <Button size={"sm"} disabled={!(eventOverviews && total && eventOverviews.length < total)} onClick={() => {
                    if (eventOverviews) {
                        getEventOverviews({
                            startIndex: eventOverviews.length,
                            limit: EVENTS_PER_LOAD,
                            eventOverviewFilter
                        });
                    }
                }}>
                    Load more events
                </Button>
                <span className="ms-2">(showing {eventOverviews?.length ?? 0} of {total ?? 0})</span>
            </div>
            <div className="float-end mb-4">
                <Label>
                    <Input type="select" value={eventOverviewFilter} onChange={e => {setEventOverviewFilter(e.target.value as EventOverviewFilter);}}>
                        {Object.entries(EventOverviewFilter).map(([filterLabel, filterValue]) =>
                            <option key={filterValue} value={filterValue}>{filterLabel}</option>
                        )}
                    </Input>
                </Label>
            </div>
        </div>

        <ShowLoadingQuery
            query={eventOverviewQuery}
            defaultErrorTitle={"Error loading event overviews"}
            thenRender={({eventOverviews}) => {
                return <>
                    {atLeastOne(eventOverviews.length) && <div className="overflow-auto">
                        <Table bordered className="mb-0 bg-white">
                            <thead>
                                <tr>
                                    <th className="align-middle text-center">
                                        Actions
                                    </th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('title'); setReverse(!reverse);}}>
                                        Title
                                    </Button></th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('date'); setReverse(!reverse);}}>
                                        Date
                                    </Button></th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('bookingDeadline'); setReverse(!reverse);}}>
                                        Booking deadline
                                    </Button></th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('location.address.town'); setReverse(!reverse);}}>
                                        Location
                                    </Button></th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('eventStatus'); setReverse(!reverse);}}>
                                        Status
                                    </Button></th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('numberOfConfirmedBookings'); setReverse(!reverse);}}>
                                        Number confirmed
                                    </Button></th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('numberOfWaitingListBookings'); setReverse(!reverse);}}>
                                        Number waiting
                                    </Button></th>
                                    <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('numberAttended'); setReverse(!reverse);}}>
                                        Number attended
                                    </Button></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderBy(eventOverviews, [sortPredicate], [reverse ? "desc" : "asc"])
                                    .map((event) => <tr key={event.id} data-testid="event-manager-row">
                                        <td className="align-middle"><Button color={siteSpecific("keyline", "primary")} outline={isAda} className="btn-sm" onClick={() => setSelectedEventId(event.id as string)}>
                                            Manage
                                        </Button></td>
                                        <td className="align-middle"><Link to={`/events/${event.id}`} target="_blank">{event.title} - {event.subtitle}</Link></td>
                                        <td className="align-middle"><DateString>{event.date}</DateString></td>
                                        <td className="align-middle"><DateString>{event.bookingDeadline}</DateString></td>
                                        <td className="align-middle">{event.location && event.location.address && event.location.address.town}</td>
                                        <td className="align-middle">{event.eventStatus}</td>
                                        <td className="align-middle">{event.numberOfConfirmedBookings} / {event.numberOfPlaces}</td>
                                        <td className="align-middle">{event.numberOfWaitingListBookings}</td>
                                        <td className="align-middle">{event.numberAttended}</td>
                                    </tr>)
                                }
                            </tbody>
                        </Table>
                    </div>}
                    {zeroOrLess(eventOverviews.length) && <p className="text-center">
                        <strong>No events to display with this filter setting</strong>
                    </p>}
                </>;
            }} />
    </Accordion>;
};
