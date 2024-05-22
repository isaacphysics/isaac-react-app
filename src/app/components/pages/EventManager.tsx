import React, { useEffect, useRef, useState } from "react";
import { PotentialUser } from "../../../IsaacAppTypes";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { ADMIN_CRUMB, isEventLeader, scrollVerticallyIntoView } from "../../services";
import { EventOverviews } from "../elements/panels/EventOverviews";
import { SelectedEventDetails } from "../elements/panels/SelectedEventDetails";
import { ManageExistingBookings } from "../elements/panels/ManageExistingBookings";
import { AddUsersToBooking } from "../elements/panels/AddUsersToBooking";
import { EventAttendance } from "../elements/panels/EventAttendance";
import { Button, Container } from "reactstrap";

const EventButton = ({ link, text, className }: { link: string; text: string; className?: string }) => (
  <Button
    color="primary"
    size="md"
    href={link}
    className={`mx-3 ${className}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {text}
  </Button>
);

export const EventManager = ({ user }: { user: PotentialUser }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEventRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEventId !== null && selectedEventRef.current !== null) {
      scrollVerticallyIntoView(selectedEventRef.current);
    }
  }, [selectedEventId]);

  return (
    <Container>
      <TitleAndBreadcrumb intermediateCrumbs={[ADMIN_CRUMB]} currentPageTitle="Event booking admin" />
      <div className="my-3 d-flex flex-column flex-sm-row justify-content-end">
        <EventButton link="https://forms.office.com/e/ZrijWx8gcw" text="Event listing form" className="mb-2 mb-sm-0" />
        <EventButton
          link="https://myscience.atlassian.net/wiki/spaces/NN/pages/4119658517/Events+toolkit"
          text="Events toolkit"
        />
      </div>
      <div className="mb-5 mx-n4 mx-sm-n5 pt-3" id="event-admin">
        <EventOverviews user={user} setSelectedEventId={setSelectedEventId} />
        {selectedEventId !== null && (
          <React.Fragment>
            <div ref={selectedEventRef} className="mb-3">
              <SelectedEventDetails eventId={selectedEventId} />
            </div>
            <div>
              <ManageExistingBookings user={user} eventBookingId={selectedEventId} />
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
    </Container>
  );
};
