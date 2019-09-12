import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ADMIN_CRUMB} from "../../services/constants";
import {scrollVerticallyIntoView} from "../../services/scrollManager";
import {EventOverviews} from "../elements/panels/EventOverviews";
import {SelectedEventDetails} from "../elements/panels/SelectedEventDetails";
import {ManageExistingBookings} from "../elements/panels/ManageExistingBookings";
import {AddUsersToBooking} from "../elements/panels/AddUsersToBooking";
import {EventAttendance} from "../elements/panels/EventAttendance";

export const EventAdminManager = ({user}: {user: LoggedInUser}) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const selectedEventRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedEventId !== null && selectedEventRef.current !== null) {
            scrollVerticallyIntoView(selectedEventRef.current);
        }
    }, [selectedEventId]);

    return  <RS.Container>
        <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle="Event booking admin"/>
        <div className="my-5">
            <div>
                <EventOverviews setSelectedEventId={setSelectedEventId} />
            </div>
            {selectedEventId !== null && <React.Fragment>
                <div ref={selectedEventRef} className="mb-3">
                    <SelectedEventDetails eventId={selectedEventId} />
                </div>
                <div>
                    <ManageExistingBookings user={user} eventBookingId={selectedEventId} />
                </div>
                <div>
                    <AddUsersToBooking />
                </div>
                <div>
                    <EventAttendance eventId={selectedEventId} />
                </div>
            </React.Fragment>}
        </div>
    </RS.Container>
};
