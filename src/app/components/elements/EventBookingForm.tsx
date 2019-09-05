import React, {useState} from "react";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import {AdditionalInformation, AugmentedEvent, LoggedInUser, Toast} from "../../../IsaacAppTypes";
import {SchoolInput} from "./inputs/SchoolInput";
import {atLeastOne, validateUserSchool, zeroOrLess} from "../../services/validation";
import {isTeacher} from "../../services/user";
import {useDispatch} from "react-redux";
import {addToEventWaitingList, makeEventBookingRequest, requestEmailVerification, showToast} from "../../state/actions";

interface EventBookingFormProps {
    event: AugmentedEvent;
    user: LoggedInUser;
}

export const EventBookingForm = ({event, user}: EventBookingFormProps) => {
    const dispatch = useDispatch();

    const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});
    const [verifyEmailRequestSent, setVerifyEmailRequestSent] = useState(false);
    const targetUser = user; // For a future feature

    const isStudentEvent = event.tags !== undefined && event.tags.indexOf('student') != -1;
    const bookable = event.withinBookingDeadline && event.eventStatus != 'WAITING_LIST_ONLY' && (atLeastOne(event.placesAvailable) || (isStudentEvent && isTeacher(targetUser)));
    const applyable = !event.userOnWaitList && (event.eventStatus == 'WAITING_LIST_ONLY' || zeroOrLess(event.placesAvailable) || !event.withinBookingDeadline) && !(isStudentEvent && isTeacher(targetUser)) ;
    const submissionTitle = bookable? "Book now" : event.withinBookingDeadline ? "Apply" : "Apply -deadline past";

    function updateAdditionalInformation(update: AdditionalInformation) {
        setAdditionalInformation(Object.assign({}, additionalInformation, update));
    }

    function validateSubmission(user: LoggedInUser, additionalInformation: AdditionalInformation) {
        const failureToast: Toast = {color: "danger", title: "Validation error", timeout: 5000, body: "Required information is not present."};
        if (!user.loggedIn) {
            return false
        }

        if (!validateUserSchool(Object.assign({password: null}, user))) {
            dispatch(showToast(Object.assign({}, failureToast, {
                title: "School information required", body: "You must enter a school in order to book on to this event."
            })));
            return false;
        }

        // validation for users / forms that indicate the booker is not a teacher
        if (user.role == 'STUDENT' && !(additionalInformation.yearGroup == 'TEACHER' || additionalInformation.yearGroup == 'OTHER')) {
            if (!additionalInformation.yearGroup) {
                dispatch(showToast(Object.assign({}, failureToast, {
                    title:"Year group required", body: "You must enter a year group to proceed."
                })));
                return false;
            }

            if (!event.virtual) {
                if (!additionalInformation.emergencyName || !additionalInformation.emergencyNumber){
                    dispatch(showToast(Object.assign({}, failureToast, {
                        title: "Emergency contact details required", body: "You must enter a emergency contact details in order to book on to this event."
                    })));
                    return false;
                }
            }
        }

        // validation for users that are teachers
        if (user.role != 'STUDENT') {
            if (!additionalInformation.jobTitle) {
                dispatch(showToast(Object.assign({}, failureToast, {
                    title: "Job title required", body: "You must enter a job title to proceed."
                })));
                return false;
            }
        }

        return true;
    }

    function submitBooking(formEvent: React.FormEvent<HTMLFormElement>) {
        formEvent.preventDefault();
        if (validateSubmission(targetUser, additionalInformation)) {
            if (bookable) {
                dispatch(makeEventBookingRequest(event.id as string, additionalInformation));
            } else if (applyable) {
                dispatch(addToEventWaitingList(event.id as string, additionalInformation));
            } else {
                // should never reach here
            }
        }
    }

    return <React.Fragment>
        {targetUser.loggedIn && <RS.Card className="mb-4">
            <RS.CardBody>
                <h3>Event booking form</h3>
                <RS.Form onSubmit={submitBooking}>
                    {/* Account Information */}
                    <RS.Card className="mb-3 bg-light">
                        <RS.CardBody>
                            <legend>Your account information (<Link to="/account" className="text-secondary">update</Link>)</legend>
                            <RS.Row>
                                <RS.Col md={6}>
                                    {/* Should be impossible to not have a first name */}
                                    <RS.Label htmlFor="account-firstname" className="form-required">
                                        First name
                                    </RS.Label>
                                    <RS.Input id="account-firstname" name="firstname" type="text" disabled value={targetUser.givenName} />
                                </RS.Col>
                                <RS.Col md={6}>
                                    {/* Should be impossible to not have a last name */}
                                    <RS.Label htmlFor="account-lastname" className="form-required">
                                        Last name
                                    </RS.Label>
                                    <RS.Input id="account-lastname" name="secondname" type="text" disabled value={targetUser.familyName} />
                                </RS.Col>
                            </RS.Row>

                            <div>
                                <RS.Label htmlFor="account-email" className="form-required">
                                    Email address
                                    <RS.Input id="account-email" name="email" type="email" disabled value={targetUser.email} valid={targetUser.emailVerificationStatus != 'VERIFIED'} />
                                    <RS.FormFeedback>You must verify your email address to book on events. This is so we can send you details about the event.</RS.FormFeedback>
                                </RS.Label>
                                {targetUser.emailVerificationStatus != 'VERIFIED' && !verifyEmailRequestSent && <RS.Button
                                    color="link" onClick={() => {
                                        dispatch(requestEmailVerification());
                                        setVerifyEmailRequestSent(true);
                                    }}
                                >
                                    Verify your email before booking
                                </RS.Button>}
                                {targetUser.emailVerificationStatus != 'VERIFIED' && verifyEmailRequestSent && <span>
                                    We have sent an email to {targetUser.email}. Please follow the instructions in the email prior to booking.
                                </span>}
                            </div>
                            <div>
                                <SchoolInput userToUpdate={Object.assign({password: null}, targetUser)} submissionAttempted />
                            </div>
                            <div className="text-center alert-warning p-1">
                                If this information is not correct, please update it on your <Link to="/account">account page</Link>.
                            </div>
                        </RS.CardBody>
                    </RS.Card>

                    {/* Event Booking Details */}
                    <RS.Card className="mb-3">
                        <RS.CardBody>
                            <legend>Event booking details</legend>

                            <div>
                                {targetUser.role != 'STUDENT' && <React.Fragment>
                                    <RS.Label htmlFor="job-title" className="form-required">Job title</RS.Label>
                                    <RS.Input
                                        id="job-title" name="job-title" type="text" value={additionalInformation.jobTitle}
                                        onChange={event => updateAdditionalInformation({jobTitle: event.target.value})}
                                    />
                                </React.Fragment>}
                                {targetUser.role == 'STUDENT' && <React.Fragment>
                                    <RS.Label htmlFor="year-group" className="form-required">
                                        School year group
                                    </RS.Label>
                                    <RS.Input
                                        type="select" id="year-group" name="year-group" value={additionalInformation.yearGroup}
                                        onChange={event => updateAdditionalInformation({yearGroup: event.target.value})}
                                    >
                                        <option value="" />
                                        {event.student && <option value="9">Year 9</option>}
                                        {event.student && <option value="10">Year 10</option>}
                                        {event.student && <option value="11">Year 11</option>}
                                        {event.student && <option value="12">Year 12</option>}
                                        {event.student && <option value="13">Year 13</option>}
                                        <option value="TEACHER">N/A - Teacher</option>
                                        <option value="OTHER">N/A - Other</option>
                                    </RS.Input>
                                    {event.teacher && additionalInformation.yearGroup == 'TEACHER' && <div className="mt-2 text-right">
                                        <Link to="/pages/contact_us_teacher">Click to upgrade to a teacher account</Link> for free!
                                    </div>}
                                </React.Fragment>}
                            </div>

                            {!event.virtual && <div>
                                <div>
                                    <RS.Label htmlFor="medical-reqs">
                                        Dietary requirements or relevant medical conditions
                                        <span id="dietary-reqs-help" aria-haspopup="true" className="icon-help has-tip" />
                                        <RS.UncontrolledPopover trigger="click" placement="bottom" target="dietary-reqs-help">
                                            <RS.PopoverBody>For example, it is important for us to know if you have a severe allergy and/or carry an EpiPen, are prone to fainting, suffer from epilepsy...</RS.PopoverBody>
                                        </RS.UncontrolledPopover>
                                    </RS.Label>
                                    <RS.Input
                                        id="medical-reqs" name="medical-reqs" type="text" value={additionalInformation.medicalRequirements}
                                        onChange={event => updateAdditionalInformation({medicalRequirements: event.target.value})}
                                    />
                                </div>

                                <div>
                                    <RS.Label htmlFor="access-reqs">
                                        Accessibility requirements
                                        <span id="access-reqs-help" aria-haspopup="true" className="icon-help has-tip" />
                                        <RS.UncontrolledPopover trigger="click" placement="bottom" target="access-reqs-help">
                                            <RS.PopoverBody>For example, please let us know if you need wheelchair access, hearing loop or if we can help with any special adjustments.</RS.PopoverBody>
                                        </RS.UncontrolledPopover>
                                    </RS.Label>
                                    <RS.Input
                                        id="access-reqs" name="access-reqs" type="text" value={additionalInformation.accessibilityRequirements}
                                        onChange={event => updateAdditionalInformation({accessibilityRequirements: event.target.value})}
                                    />
                                </div>

                                {additionalInformation.yearGroup != 'TEACHER' && additionalInformation.yearGroup != 'OTHER' && <RS.Row>
                                    <RS.Col xs={12}>
                                        <h3>Emergency contact details</h3>
                                    </RS.Col>
                                    <RS.Col md={6}>
                                        <RS.Label htmlFor="emergency-name" className="form-required">
                                            Contact name
                                        </RS.Label>
                                        <RS.Input
                                            id="emergency-name" name="emergency-name" type="text" value={additionalInformation.emergencyName}
                                            onChange={event => updateAdditionalInformation({emergencyName: event.target.value})}
                                        />
                                    </RS.Col>
                                    <RS.Col md={6}>
                                        <RS.Label htmlFor="emergency-number" className="form-required">
                                            Contact telephone number
                                        </RS.Label>
                                        <RS.Input
                                            id="emergency-number" name="emergency-number" type="text" value={additionalInformation.emergencyNumber}
                                            onChange={event => updateAdditionalInformation({emergencyNumber: event.target.value})}
                                        />
                                    </RS.Col>
                                </RS.Row>}
                            </div>}
                        </RS.CardBody>
                    </RS.Card>

                    <div>
                        {atLeastOne(event.numberOfPlaces) && !event.userBooked && event.withinBookingDeadline &&
                        (atLeastOne(event.placesAvailable) || (isStudentEvent && isTeacher(targetUser))) && <p className="mb-3">
                            <small>
                                By requesting to book on this event, you are granting event organisers access to the information provided in the form above.
                                You are also giving them permission to set you pre-event work and view your progress.
                                You can manage access to your progress data in your <Link to="/account#teacherconnections">account settings</Link>.
                            </small>
                        </p>}

                        {atLeastOne(event.numberOfPlaces) && !event.userBooked && (bookable || applyable) && <div>
                            <RS.Input type="submit" value={submissionTitle} className="btn btn-secondary btn-xl border-0 w-auto" />
                        </div>}
                    </div>
                </RS.Form>
            </RS.CardBody>
        </RS.Card>}
    </React.Fragment>
};
