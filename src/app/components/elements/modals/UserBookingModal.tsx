import React, {useState} from "react";
import {UserSummaryForAdminUsersDTO} from "../../../../IsaacApiTypes";
import {AdditionalInformation, AugmentedEvent} from "../../../../IsaacAppTypes";
import {
    closeActiveModal,
    showErrorToast,
    store,
    useAppDispatch,
    useBookUserOnEventMutation
} from "../../../state";
import * as RS from "reactstrap";
import {atLeastOne, formatBookingModalConfirmMessage, siteSpecific, zeroOrLess} from "../../../services";
import {EventBookingForm} from "../EventBookingForm";

export function userBookingModal(selectedUser: UserSummaryForAdminUsersDTO, selectedEvent: AugmentedEvent, eventBookingIds: number[]) {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},

        title: eventBookingIds.includes(selectedUser.id as number) && zeroOrLess(selectedEvent.placesAvailable) ?
            `Add ${selectedUser.givenName} ${selectedUser.familyName} to waiting list` :
            `Create a booking for ${selectedUser.givenName} ${selectedUser.familyName}`,

        body: function UserBookingModalBody() {
            const dispatch = useAppDispatch();

            const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});

            function updateAdditionalInformation(update: AdditionalInformation) {
                setAdditionalInformation(Object.assign({}, additionalInformation, update));
            }
            const userCanBeBookedOnEvent = selectedEvent.eventStatus != 'WAITING_LIST_ONLY' &&
                !eventBookingIds.includes(selectedUser.id as number) && atLeastOne(selectedEvent.placesAvailable);
            const userCanBeAddedToWaitingList = selectedEvent.eventStatus == 'WAITING_LIST_ONLY' ||
                (!eventBookingIds.includes(selectedUser.id as number) && zeroOrLess(selectedEvent.placesAvailable));

            const [bookUserOnEvent] = useBookUserOnEventMutation();
            function makeUserBooking(formEvent: React.FormEvent) {
                if (formEvent) {formEvent.preventDefault()}
                if (additionalInformation.authorisation === undefined || (additionalInformation.authorisation === "OTHER" && additionalInformation.authorisationOther === undefined)) {
                    dispatch(showErrorToast("Event booking failed", "You must provide an authorisation reason to complete this request."));
                    return;
                }
                bookUserOnEvent({eventId: selectedEvent.id as string, userId: selectedUser.id as number, additionalInformation})
                    .then(() => dispatch(closeActiveModal()));
            }

            return <RS.Form onSubmit={makeUserBooking} className="mb-4">
                <EventBookingForm
                    event={selectedEvent} targetUser={selectedUser}
                    additionalInformation={additionalInformation} updateAdditionalInformation={updateAdditionalInformation}
                />
                <span>
                    <p>
                        <small>
                            Warning, by booking a user on this event, it may eventually lead to their personal {" "}
                            information being shared with a third party. You must therefore confirm how this booking {" "}
                            has been authorised. The data owner is always the {siteSpecific("Isaac", "Ada")} user being booked on to the event.
                        </small>
                    </p>

                    <RS.Label htmlFor="form-authorisation" className="form-required">
                        Booking/personal data sharing authorised by
                    </RS.Label>
                    <RS.Input
                        type="select" id="form-authorisation" name="form-authorisation" value={additionalInformation.authorisation || ""}
                        onChange={event => updateAdditionalInformation({authorisation: event.target.value})}
                    >
                        <option value="" />
                        <option value="Telephone-Owner">Telephone - Data Owner</option>
                        <option value="Email-Owner">Verified email - Data Owner</option>
                        <option value="OTHER">Other - Please specify</option>
                    </RS.Input>
                    {additionalInformation.authorisation === "OTHER" && <RS.Input
                        type="text" className="mt-2" value={additionalInformation.authorisationOther || ""}
                        onChange={event => updateAdditionalInformation({authorisationOther: event.target.value})}
                    />}

                    {(userCanBeBookedOnEvent || userCanBeAddedToWaitingList) && <RS.Input className="btn btn-block btn-secondary border-0 mt-3"
                        type="submit" value={formatBookingModalConfirmMessage(selectedEvent, userCanBeBookedOnEvent)}
                    />}
                </span>
            </RS.Form>
        },
    }
}
