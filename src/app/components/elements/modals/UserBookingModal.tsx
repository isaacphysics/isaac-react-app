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
import {
    atLeastOne,
    formatBookingModalConfirmMessage,
    SITE_TITLE_SHORT,
    zeroOrLess
} from "../../../services";
import {EventBookingForm} from "../EventBookingForm";
import { Form, Label, Input } from "reactstrap";
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

export function userBookingModal(selectedUser: UserSummaryForAdminUsersDTO, selectedEvent: AugmentedEvent, eventBookingIds: number[]) {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},

        title: eventBookingIds.includes(selectedUser.id as number) && zeroOrLess(selectedEvent.placesAvailable) ?
            i18next.t('addGivennameFamilynameToWaitingList', 'Add {{givenName}} {{familyName}} to waiting list', { givenName: selectedUser.givenName, familyName: selectedUser.familyName }) :
            i18next.t('createABookingForGivennameFamilyname', 'Create a booking for {{givenName}} {{familyName}}', { givenName: selectedUser.givenName, familyName: selectedUser.familyName }),

        body: function UserBookingModalBody() {
            const { t } = useTranslation()
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
                if (formEvent) {formEvent.preventDefault();}
                if (additionalInformation.authorisation === undefined || (additionalInformation.authorisation === "OTHER" && additionalInformation.authorisationOther === undefined)) {
                    dispatch(showErrorToast("Event booking failed", "You must provide an authorisation reason to complete this request."));
                    return;
                }
                bookUserOnEvent({eventId: selectedEvent.id as string, userId: selectedUser.id as number, additionalInformation})
                    .then(() => dispatch(closeActiveModal()));
            }

            return <Form onSubmit={makeUserBooking} className="mb-4">
                <EventBookingForm
                    event={selectedEvent} targetUser={selectedUser}
                    additionalInformation={additionalInformation} updateAdditionalInformation={updateAdditionalInformation}
                />
                <span>
                    <p>
                        <small>
                            {t('warningByBookingAUserOnThisEventItMayEventuallyLeadToTheirPersonal', 'Warning, by booking a user on this event, it may eventually lead to their personal')} {" "}
                            {t('informationBeingSharedWithAThirdPartyYouMustThereforeConfirmHowThisBooking', 'information being shared with a third party. You must therefore confirm how this booking')} {" "}{t('hasBeenAuthorisedTheDataOwnerIsAlwaysTheSite_title_shortUserBeingBookedOnToTheEvent', 'has been authorised. The data owner is always the {{SITE_TITLE_SHORT}} user being booked on to the event.', { SITE_TITLE_SHORT })}</small>
                    </p>

                    <Label htmlFor="form-authorisation" className="form-required">
                        {t('bookingpersonalDataSharingAuthorisedBy', 'Booking/personal data sharing authorised by')}
                    </Label>
                    <Input
                        type="select" id="form-authorisation" name="form-authorisation" value={additionalInformation.authorisation || ""}
                        onChange={event => updateAdditionalInformation({authorisation: event.target.value})}
                    >
                        <option value="" />
                        <option value="Telephone-Owner">{t('telephoneDataOwner', 'Telephone - Data Owner')}</option>
                        <option value="Email-Owner">{t('verifiedEmailDataOwner', 'Verified email - Data Owner')}</option>
                        <option value="OTHER">{t('otherPleaseSpecify', 'Other - Please specify')}</option>
                    </Input>
                    {additionalInformation.authorisation === "OTHER" && <Input
                        type="text" className="mt-2" value={additionalInformation.authorisationOther || ""}
                        onChange={event => updateAdditionalInformation({authorisationOther: event.target.value})}
                    />}

                    {(userCanBeBookedOnEvent || userCanBeAddedToWaitingList) && <Input className="btn w-100 btn-secondary border-0 mt-3"
                        type="submit" value={formatBookingModalConfirmMessage(selectedEvent, userCanBeBookedOnEvent)}
                    />}
                </span>
            </Form>;
        },
    };
}
