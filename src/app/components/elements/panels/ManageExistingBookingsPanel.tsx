import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {Accordion} from "../Accordion";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {atLeastOne, zeroOrLess} from "../../../services/validation";

export const ManageExistingBookingsPanel = ({eventBookingId}: {eventBookingId: string}) => {
    const dispatch = useDispatch();
    // useEffect(() => {dispatch(getEventBookings(eventBookingId))}, [eventBookingId]);
    // const eventBookings = useSelector(((state: AppState) => state && state.eventBookings || []));
    const eventBookings = [];

    return <Accordion title="Manage current bookings">
        {atLeastOne(eventBookings.length) && <RS.Table>
            CURRENT BOOKINGS
        </RS.Table>}
        {zeroOrLess(eventBookings.length) && <p className="text-center m-0">
            <strong>There aren&apos;t currently any bookings for this event.</strong>
        </p>}
    </Accordion>
};
