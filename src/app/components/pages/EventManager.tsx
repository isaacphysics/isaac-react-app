import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {PotentialUser} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ADMIN_CRUMB, isEventLeader, scrollVerticallyIntoView} from "../../services";
import {EventOverviews} from "../elements/panels/EventOverviews";
import {SelectedEventDetails} from "../elements/panels/SelectedEventDetails";
import {ManageExistingBookings} from "../elements/panels/ManageExistingBookings";
import {AddUsersToBooking} from "../elements/panels/AddUsersToBooking";
import {EventAttendance} from "../elements/panels/EventAttendance";

export const EventManager = ({user}: {user: PotentialUser}) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const selectedEventRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedEventId !== null && selectedEventRef.current !== null) {
            scrollVerticallyIntoView(selectedEventRef.current);
        }
    }, [selectedEventId]);

    return (
      <RS.Container>
        <TitleAndBreadcrumb
          intermediateCrumbs={[ADMIN_CRUMB]}
          currentPageTitle="Event booking admin"
        />
        <div className="my-5 mx-n4 mx-sm-n5">
          <EventOverviews user={user} setSelectedEventId={setSelectedEventId} />
          {selectedEventId !== null && (
            <React.Fragment>
              <div ref={selectedEventRef} className="mb-3">
                <SelectedEventDetails eventId={selectedEventId} />
              </div>
              <div>
                <ManageExistingBookings
                  user={user}
                  eventBookingId={selectedEventId}
                />
              </div>
              {!isEventLeader(user) && (
                <div>
                  <AddUsersToBooking />
                </div>
              )}
              <div>
                <EventAttendance user={user} eventId={selectedEventId} />
              </div>
            </React.Fragment>
          )}
        </div>
      </RS.Container>
    );
};
