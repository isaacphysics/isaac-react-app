import React, {useState} from "react";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import {AugmentedEvent, LoggedInUser} from "../../../IsaacAppTypes";
import {SchoolInput} from "./inputs/SchoolInput";

interface AdditionalInformation {
    yearGroup?: string;
}
interface EventBookingFormProps {
    event: AugmentedEvent;
    user: LoggedInUser;
}
export const EventBookingForm = ({event, user}: EventBookingFormProps) => {
    const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});
    const targetUser = user; // For a future feature
    const editingSelf = true;

    return <React.Fragment>
        {targetUser.loggedIn && <RS.Card className="mb-4">
            <RS.CardBody>
                <h3>Event Booking Form</h3>
                <RS.Form>
                    {/* Account Information */}
                    <fieldset>
                        <legend>Your Account Information <Link to="/account">(update)</Link></legend>
                        <RS.Row>
                            <RS.Col md={6}>
                                <RS.Label htmlFor="account-firstname">
                                    <strong>First Name</strong>
                                    {/* TODO */}
                                    {/*{<span className="ru-error-message"*/}
                                    {/*      ng-if="account.firstname.$invalid && account.firstname.$dirty">*/}
                                    {/*  Required*/}
                                    {/*</span>}*/}
                                </RS.Label>
                                <RS.Input id="account-firstname" name="firstname" type="text" disabled required value={targetUser.givenName}/>
                            </RS.Col>
                            <RS.Col md={6}>
                                <RS.Label htmlFor="account-lastname">
                                    <strong>Last Name</strong>
                                    {/* TODO */}
                                    {/*<span className="ru-error-message"*/}
                                    {/*      ng-if="account.secondname.$invalid && account.secondname.$dirty">*/}
                                    {/*    Required*/}
                                    {/*</span>*/}
                                </RS.Label>
                                <RS.Input id="account-lastname" name="secondname" type="text" disabled required value={targetUser.familyName} />
                            </RS.Col>
                        </RS.Row>

                        <RS.Row>
                            <RS.Col>
                                <RS.Label htmlFor="account-email">
                                    <strong>Email Address</strong>
                                    {/* TODO */}
                                    {targetUser.emailVerificationStatus != 'VERIFIED' && <span
                                        data-ot="You must verify your email address to book on events. This is so we can send you details about the event."
                                        className="dl-alert warning hide-for-small-only field-marker"
                                        aria-haspopup="true"
                                    >!</span>}
                                    <span className="ru-form-required"></span>
                                    <span className="ru-error-message" ng-if="account.email.$invalid && account.email.$dirty">
                                        Enter a valid email
                                    </span>
                                </RS.Label>
                                <RS.Input id="account-email" name="email" type="email" disabled value={targetUser.email} />
                                {/* TODO */}
                                {/*<a ng-show="targetUser.emailVerificationStatus != 'VERIFIED' && !verifyEmailRequestSent"*/}
                                {/*   href="javascript:void(0)" ng-click="requestEmailVerification(); verifyEmailRequestSent=true">Verify*/}
                                {/*    your email before booking</a>*/}
                                {/*<span ng-show="targetUser.emailVerificationStatus != 'VERIFIED' && verifyEmailRequestSent">We have sent an email to {{*/}
                                {/*    targetUser*/}
                                {/*    .email*/}
                                {/*}}. Please follow the instructions in the email prior to booking.</span>*/}
                            </RS.Col>
                        </RS.Row>
                    </fieldset>

                    {/* Event Booking Details */}
                    <fieldset>
                        <legend>Event Booking Details</legend>
                        {editingSelf && <RS.Row>
                            <RS.Col>
                                <RS.Label>
                                    <strong>Your School</strong>
                                    {/* TODO */}
                                    <span
                                        aria-haspopup="true" className="icon-help has-tip"
                                        data-ot="You can search for schools and universities in the UK or Ireland. Use the 'other' box if you study elsewhere or to type 'none' if you are not at school."
                                    />
                                    <span className="ru-form-required" />
                                </RS.Label>
                                {/* TODO school input */}
                                {/*<SchoolInput userToUpdate={} setUserToUpdate={} submissionAttempted={} /> */}
                            </RS.Col>
                        </RS.Row>}

                        <RS.Row>
                            <RS.Col>
                                {targetUser.role != 'STUDENT' && <React.Fragment>
                                    <RS.Label htmlFor="job-title">
                                        <strong>Job Title</strong>
                                        <span className="ru-form-required"></span>
                                    </RS.Label>
                                    {/* TODO store this value somewhere */}
                                    <RS.Input id="job-title" name="job-title" type="text" ng-model="additionalInformation.jobTitle" required />
                                </React.Fragment>}
                                {targetUser.role == 'STUDENT' && <React.Fragment>
                                    <RS.Label htmlFor="year-group">
                                        <strong>School Year Group</strong>
                                        <span className="ru-form-required"></span>
                                    </RS.Label>
                                    {/* TODO MT */}
                                    <select id="year-group" name="year-group" ng-model="additionalInformation.yearGroup" required>
                                        {event.student && <option value="9">Year 9</option>}
                                        {event.student && <option value="10">Year 10</option>}
                                        {event.student && <option value="11">Year 11</option>}
                                        {event.student && <option value="12">Year 12</option>}
                                        {event.student && <option value="13">Year 13</option>}
                                        <option value="TEACHER">N/A - Teacher</option>
                                        <option value="OTHER">N/A - Other</option>
                                    </select>
                                    {/* TODO */}
                                    {event.teacher && additionalInformation.yearGroup == 'TEACHER' && <strong>
                                        <a ui-sref="pages({id: 'contact_us_teacher'})" target="_blank">Click to upgrade to a teacher account</a> for free!
                                    </strong>}
                                </React.Fragment>}
                            </RS.Col>
                        </RS.Row>

                        {!event.virtual && <div>
                            <div>
                                <RS.Label htmlFor="medical-reqs">
                                    <strong>Dietary Requirements or Relevant Medical Conditions</strong>
                                    <span aria-haspopup="true" className="icon-help has-tip"
                                        data-ot="For example, it is important for us to know if you have a severe allergy and/or carry an EpiPen, are prone to fainting, suffer from epilepsy..."></span>
                                </RS.Label>
                                <RS.Input id="medical-reqs" name="medical-reqs" type="text" ng-model="additionalInformation.medicalRequirements" />
                            </div>

                            <div>
                                <RS.Label htmlFor="access-reqs">
                                    <strong>Accessibility Requirements</strong>
                                    <span aria-haspopup="true" className="icon-help has-tip"
                                        data-ot="For example, please let us know if you need wheelchair access, hearing loop or if we can help with any special adjustments." />
                                </RS.Label>
                                <RS.Input id="access-reqs" name="access-reqs" type="text" ng-model="additionalInformation.accessibilityRequirements" />
                            </div>

                            {additionalInformation.yearGroup != 'TEACHER' && additionalInformation.yearGroup != 'OTHER' && <RS.Row>
                                <RS.Col xs={12}>
                                    <h3>Emergency Contact Details</h3>
                                </RS.Col>
                                <RS.Col md={6}>
                                    <RS.Label htmlFor="emergency-name">
                                        <strong>Contact Name</strong>
                                        <span className="ru-form-required"></span>
                                    </RS.Label>
                                    <RS.Input id="emergency-name" name="emergency-name" ng-model="additionalInformation.emergencyName" type="text" required/>
                                </RS.Col>
                                <RS.Col md={6}>
                                    <RS.Label htmlFor="emergency-number">
                                        <strong>Contact Telephone Number</strong>
                                        <span className="ru-form-required"></span>
                                    </RS.Label>
                                    <RS.Input id="emergency-number" name="emergency-number" type="text"
                                        ng-model="additionalInformation.emergencyNumber" required/>
                                </RS.Col>
                            </RS.Row>}
                        </div>}
                    </fieldset>

                    <div>
                        {event.numberOfPlaces && event.numberOfPlaces > 0 && !event.userBooked && event.withinBookingDeadline &&
                        (event.placesAvailable && event.placesAvailable > 0 || (event.tags && event.tags.indexOf('student') != -1 && targetUser.role != 'STUDENT')) && <p className="mb-0">
                            <small>
                                By requesting to book on this event, you are granting event organisers access to the information provided in the form above.
                                You are also giving them permission to set you pre-event work and view your progress.
                                You can manage access to your progress data in your <Link to="/account#teacherconnections">account settings.</Link>
                            </small>
                        </p>}

                        {event.numberOfPlaces && event.numberOfPlaces > 0 && !event.userBooked && event.withinBookingDeadline && event.eventStatus != 'WAITING_LIST_ONLY' &&
                        (event.placesAvailable && event.placesAvailable > 0 || (event.tags && event.tags.indexOf('student') != -1 && targetUser.role != 'STUDENT')) && <RS.Button
                            onClick={() => {/* TODO requestBooking() */}}
                        >
                            Book now
                        </RS.Button>}

                        {event.numberOfPlaces && event.numberOfPlaces > 0 && !event.userBooked && !event.userOnWaitList &&
                        (event.eventStatus == 'WAITING_LIST_ONLY' || (event.placesAvailable && event.placesAvailable <= 0) || !event.withinBookingDeadline) &&
                        !(event.tags && event.tags.indexOf('student') != -1 && targetUser.role != 'STUDENT') &&
                        <RS.Button
                            onClick={() => {/* TODO addToWaitingList() */}}
                        >
                            Apply {!event.withinBookingDeadline && <> - deadline past</>}
                        </RS.Button>}
                    </div>
                </RS.Form>
            </RS.CardBody>
        </RS.Card>}
    </React.Fragment>
};
