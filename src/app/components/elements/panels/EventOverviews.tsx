import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import React, {useEffect, useState} from "react";
import {getEventOverviews} from "../../../state/actions";
import {Accordion} from "../Accordion";
import * as RS from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {Link} from "react-router-dom";
import {DateString} from "../DateString";
import {atLeastOne, zeroOrLess} from "../../../services/validation";

export enum EventOverviewFilter {
    "All events" = "ALL",
    "Upcoming events" = "FUTURE",
    "Recent events" = "RECENT",
    "Past events" = "PAST",
}

export const EventOverviews = ({setSelectedEventId}: {setSelectedEventId: (eventId: string | null) => void}) => {
    const dispatch = useDispatch();
    const eventOverviews = useSelector((state: AppState) => state && state.eventOverviews);

    const [overviewFilter, setOverviewFilter] = useState(EventOverviewFilter["Upcoming events"]);
    const [sortPredicate, setSortPredicate] = useState("date");
    const [reverse, setReverse] = useState(false);

    function sortOnPredicateAndReverse(a: object, b: object) {
        // @ts-ignore
        if (a[sortPredicate] < b[sortPredicate]) {return reverse ? 1 : -1;}
        // @ts-ignore
        else if (a[sortPredicate] > b[sortPredicate]) {return reverse ? -1 : 1;}
        else {return 0;}
    }

    useEffect(() => {
        setSelectedEventId(null);
        dispatch(getEventOverviews(overviewFilter));
    }, [overviewFilter]);

    return <Accordion title="Events overview" index={0}>
        <div className="d-flex justify-content-end mb-4">
            <RS.Label>
                <RS.Input type="select" value={overviewFilter} onChange={e => {setOverviewFilter(e.target.value as EventOverviewFilter)}}>
                    {Object.entries(EventOverviewFilter).map(([filterLabel, filterValue]) =>
                        <option key={filterValue} value={filterValue}>{filterLabel}</option>
                    )}
                </RS.Input>
            </RS.Label>
        </div>

        <ShowLoading until={eventOverviews} render={eventOverviews => <React.Fragment>
            {atLeastOne(eventOverviews.length) && <div className="overflow-auto">
                <RS.Table bordered className="mb-0 bg-white">
                    <thead>
                        <tr>
                            <th className="align-middle">
                                Actions
                            </th>
                            <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('title'); setReverse(!reverse);}}>
                                Title
                            </RS.Button></th>
                            <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('date'); setReverse(!reverse);}}>
                                Date
                            </RS.Button></th>
                            <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('bookingDeadline'); setReverse(!reverse);}}>
                                Booking Deadline
                            </RS.Button></th>
                            <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('location.address.town'); setReverse(!reverse);}}>
                                Location
                            </RS.Button></th>
                            <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('eventStatus'); setReverse(!reverse);}}>
                                Status
                            </RS.Button></th>
                            <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('numberOfConfirmedBookings'); setReverse(!reverse);}}>
                                Number Confirmed
                            </RS.Button></th>
                            <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('numberOfWaitingListBookings'); setReverse(!reverse);}}>
                                Number Waiting
                            </RS.Button></th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventOverviews.sort(sortOnPredicateAndReverse).map((event) => <tr key={event.id}>
                            <td className="align-middle"><RS.Button color="primary" outline className="btn-sm" onClick={() => setSelectedEventId(event.id as string)}>
                                Manage
                            </RS.Button></td>
                            <td className="align-middle"><Link to={`events/${event.id}`} target="_blank">{event.title} - {event.subtitle}</Link></td>
                            <td className="align-middle"><DateString>{event.date}</DateString></td>
                            <td className="align-middle"><DateString>{event.bookingDeadline}</DateString></td>
                            <td className="align-middle">{event.location && event.location.address && event.location.address.town}</td>
                            <td className="align-middle">{event.eventStatus}</td>
                            <td className="align-middle">{event.numberOfConfirmedBookings} / {event.numberOfPlaces}</td>
                            <td className="align-middle">{event.numberOfWaitingListBookings}</td>
                        </tr>)}
                    </tbody>
                </RS.Table>
            </div>}
            {zeroOrLess(eventOverviews.length) && <p>
                <strong>No events to display with this filter setting</strong>
            </p>}
        </React.Fragment>} />
    </Accordion>
};
