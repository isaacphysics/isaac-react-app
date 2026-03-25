import React, {useEffect, useRef, useState} from "react";
import {Container} from "reactstrap";
import {PotentialUser} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ADMIN_CRUMB, isDefined, isEventLeader, scrollVerticallyIntoView} from "../../services";
import {EventOverviews} from "../elements/panels/EventOverviews";
import {SelectedEventDetails} from "../elements/panels/SelectedEventDetails";
import {ManageExistingBookings} from "../elements/panels/ManageExistingBookings";
import {AddUsersToBooking} from "../elements/panels/AddUsersToBooking";
import {EventAttendance} from "../elements/panels/EventAttendance";
import {useAdminGetUserIdsSchoolLookupQuery, useGetEventBookingsQuery, useGetEventQuery} from "../../state";
import {skipToken} from "@reduxjs/toolkit/query";

export const EventManager = ({user}: {user: PotentialUser}) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const selectedEventRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedEventId !== null && selectedEventRef.current !== null) {
            scrollVerticallyIntoView(selectedEventRef.current);
        }
    }, [selectedEventId]);

    const {data: event} = useGetEventQuery(selectedEventId ?? skipToken);
    const {data: eventBookings} = useGetEventBookingsQuery(selectedEventId ?? skipToken);
    const eventBookingUserIds = eventBookings?.map(booking => booking.userBooked && booking.userBooked.id).filter(isDefined);
    const {data: userIdToSchoolMapping} = useAdminGetUserIdsSchoolLookupQuery(eventBookingUserIds?.length ? eventBookingUserIds : skipToken);

    return  <Container>
        <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle="Event booking admin" icon={{type: "icon", icon: "icon-events"}}/>
        <div className="my-7">
            <EventOverviews user={user} setSelectedEventId={setSelectedEventId} />
            <div className="mt-3" ref={selectedEventRef}/>
            {selectedEventId !== null && event && <>
                <div className="mb-3">
                    <SelectedEventDetails event={event} />
                </div>
                <div>
                    <ManageExistingBookings
                        user={user} eventId={selectedEventId} eventBookings={eventBookings ?? []}
                        userIdToSchoolMapping={userIdToSchoolMapping ?? {}}
                    />
                </div>
                {!isEventLeader(user) && <div>
                    <AddUsersToBooking event={event} eventBookingUserIds={eventBookingUserIds ?? []} />
                </div>}
                <div>
                    <EventAttendance
                        user={user} eventId={selectedEventId} eventBookings={eventBookings ?? []}
                        event={event} userIdToSchoolMapping={userIdToSchoolMapping ?? {}}
                    />
                </div>
            </>}
        </div>
    </Container>;
};
