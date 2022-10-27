import React, {useState} from "react";
import * as RS from "reactstrap";
import {AdditionalInformation, AugmentedEvent} from "../../../IsaacAppTypes";
import {SchoolInput} from "./inputs/SchoolInput";
import {requestEmailVerification, selectors, useAppDispatch, useAppSelector} from "../../state";
import {UserSummaryWithEmailAddressDTO} from "../../../IsaacApiTypes";
import {examBoardLabelMap, isCS, stageLabelMap, studentOnlyEventMessage} from "../../services";

interface EventBookingFormProps {
    event: AugmentedEvent;
    targetUser: UserSummaryWithEmailAddressDTO;
    additionalInformation: AdditionalInformation;
    updateAdditionalInformation: (update: AdditionalInformation) => void;
}

export const EventBookingForm = ({event, targetUser, additionalInformation, updateAdditionalInformation}: EventBookingFormProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const editingSelf = user && user.loggedIn && targetUser.id === user.id;

    const [verifyEmailRequestSent, setVerifyEmailRequestSent] = useState(false);

    return <React.Fragment>
        {/* Account Information */}
        <RS.Card className="mb-3 bg-light">
            <RS.CardBody>
                <legend>Your account information (<a href="/account" target="_blank" className="text-secondary">update</a>)</legend>
                <RS.Row>
                    <RS.Col md={6}>
                        {/* Should be impossible to not have a first name */}
                        <RS.Label htmlFor="account-firstname" className="form-required">
                            First name
                        </RS.Label>
                        <RS.Input id="account-firstname" name="firstname" type="text" disabled value={targetUser.givenName  || ""} />
                    </RS.Col>
                    <RS.Col md={6}>
                        {/* Should be impossible to not have a last name */}
                        <RS.Label htmlFor="account-lastname" className="form-required">
                            Last name
                        </RS.Label>
                        <RS.Input id="account-lastname" name="secondname" type="text" disabled value={targetUser.familyName || ""} />
                    </RS.Col>
                </RS.Row>

                <div>
                    <RS.Row>
                        <RS.Col md={6}>
                            <RS.Label htmlFor="account-email" className="form-required">
                                Email address
                            </RS.Label>
                            <RS.Input id="account-email" name="email" type="email" disabled value={targetUser.email || ""} invalid={targetUser.emailVerificationStatus != 'VERIFIED'} />
                            <RS.FormFeedback>
                                {editingSelf ?
                                    "You must verify your email address to book on events. This is so we can send you details about the event." :
                                    "WARNING: This email is not verified. The details about the event might not reach the user."
                                }
                            </RS.FormFeedback>
                        </RS.Col>
                        {isCS && <RS.Col md={6} className="d-none d-md-block" />}
                        <RS.Col md={6}>
                            <RS.Label htmlFor="account-stages" className="form-required">
                                Stage
                            </RS.Label>
                            <RS.Input id="account-stages" type="text" disabled value={
                                Array.from(new Set(targetUser.registeredContexts?.map(rc => stageLabelMap[rc.stage!]))).join(", ") || ""
                            } />
                        </RS.Col>
                        {isCS && <RS.Col md={6}>
                            <RS.Label htmlFor="account-examboard" className="form-required">
                                Exam board
                            </RS.Label>
                            <RS.Input id="account-examboard" type="text" disabled value={
                                Array.from(new Set(targetUser.registeredContexts?.map(rc => examBoardLabelMap[rc.examBoard!]))).join(", ") || ""
                            } />
                        </RS.Col>}
                    </RS.Row>
                    <RS.Row>
                        <RS.Col>
                            {editingSelf && targetUser.emailVerificationStatus != 'VERIFIED' && !verifyEmailRequestSent && <RS.Button
                                color="link" className="btn-underline" onClick={() => {
                                    dispatch(requestEmailVerification());
                                    setVerifyEmailRequestSent(true);
                                }}
                            >
                                Verify your email before booking
                            </RS.Button>}
                            {targetUser.emailVerificationStatus != 'VERIFIED' && verifyEmailRequestSent && <span>
                            We have sent an email to {targetUser.email}. Please follow the instructions in the email prior to booking.
                            </span>}
                        </RS.Col>
                    </RS.Row>
                </div>
                {editingSelf && <div>
                    <SchoolInput userToUpdate={Object.assign({password: null}, targetUser)} disableInput={true} submissionAttempted required />
                </div>}
                {editingSelf && <div className="text-center alert-warning p-1">
                    If this information is incorrect, please update it from your <a href="/account" target="_blank">account page</a>.
                </div>}
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
                            id="job-title" name="job-title" type="text" value={additionalInformation.jobTitle  || ""}
                            onChange={event => updateAdditionalInformation({jobTitle: event.target.value})}
                        />
                    </React.Fragment>}
                    {targetUser.role == 'STUDENT' && <React.Fragment>
                        <RS.Label htmlFor="year-group" className="form-required">
                            School year group
                        </RS.Label>
                        <RS.Input
                            type="select" id="year-group" name="year-group" value={additionalInformation.yearGroup || ""}
                            onChange={event => updateAdditionalInformation({yearGroup: event.target.value})}
                        >
                            <option value="" />
                            {event.isAStudentEvent && <option value="9">Year 9</option>}
                            {event.isAStudentEvent && <option value="10">Year 10</option>}
                            {event.isAStudentEvent && <option value="11">Year 11</option>}
                            {event.isAStudentEvent && <option value="12">Year 12</option>}
                            {event.isAStudentEvent && <option value="13">Year 13</option>}
                            {!event.isStudentOnly && <option value="TEACHER">N/A - Teacher</option>}
                            {!event.isStudentOnly && <option value="OTHER">N/A - Other</option>}
                        </RS.Input>
                        {event.isStudentOnly && <div className="text-muted">{studentOnlyEventMessage(event.id)}</div>}
                        {(event.isATeacherEvent || additionalInformation.yearGroup == 'TEACHER') && <div className="mt-2 text-right">
                            <a href="/pages/teacher_accounts" target="_blank">Click to upgrade to a teacher account</a> for free!
                        </div>}
                    </React.Fragment>}
                </div>

                {!event.isVirtual && <div>
                    <div>
                        <RS.Label htmlFor="medical-reqs">
                            Dietary requirements or relevant medical conditions
                            <span id="dietary-reqs-help" aria-haspopup="true" className="icon-help has-tip" />
                            <RS.UncontrolledPopover trigger="click" placement="bottom" target="dietary-reqs-help">
                                <RS.PopoverBody>For example, it is important for us to know if you have a severe allergy and/or carry an EpiPen, are prone to fainting, suffer from epilepsy...</RS.PopoverBody>
                            </RS.UncontrolledPopover>
                        </RS.Label>
                        <RS.Input
                            id="medical-reqs" name="medical-reqs" type="text" value={additionalInformation.medicalRequirements || ""}
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
                            id="access-reqs" name="access-reqs" type="text" value={additionalInformation.accessibilityRequirements || ""}
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
                                id="emergency-name" name="emergency-name" type="text" value={additionalInformation.emergencyName || ""}
                                onChange={event => updateAdditionalInformation({emergencyName: event.target.value})}
                            />
                        </RS.Col>
                        <RS.Col md={6}>
                            <RS.Label htmlFor="emergency-number" className="form-required">
                                Contact telephone number
                            </RS.Label>
                            <RS.Input
                                id="emergency-number" name="emergency-number" type="text" value={additionalInformation.emergencyNumber || ""}
                                onChange={event => updateAdditionalInformation({emergencyNumber: event.target.value})}
                            />
                        </RS.Col>
                    </RS.Row>}
                </div>}
                {targetUser.role != 'STUDENT' && <React.Fragment>
                    <RS.Label htmlFor="experience-level">Level of teaching experience</RS.Label>
                    <RS.Input
                        id="experience-level" name="experience-level" type="text" value={additionalInformation.experienceLevel  || ""}
                        onChange={event => updateAdditionalInformation({experienceLevel: event.target.value})}
                    />
                </React.Fragment>}
            </RS.CardBody>
        </RS.Card>
    </React.Fragment>
};
