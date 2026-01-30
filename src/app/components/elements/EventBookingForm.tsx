import React from "react";
import {AdditionalInformation, AugmentedEvent} from "../../../IsaacAppTypes";
import {SchoolInput} from "./inputs/SchoolInput";
import {selectors, useAppSelector, useRequestEmailVerificationMutation} from "../../state";
import {UserSummaryWithEmailAddressDTO} from "../../../IsaacApiTypes";
import {examBoardLabelMap, isAda, isTutor, siteSpecific, stageLabelMap, studentOnlyEventMessage} from "../../services";
import {Immutable} from "immer";
import { Card, CardBody, Row, Col, Label, Input, FormFeedback, Button, UncontrolledTooltip } from "reactstrap";
import classNames from "classnames";

interface EventBookingFormProps {
    event: AugmentedEvent;
    targetUser: Immutable<UserSummaryWithEmailAddressDTO>;
    additionalInformation: AdditionalInformation;
    updateAdditionalInformation: (update: AdditionalInformation) => void;
}

export const EventBookingForm = ({event, targetUser, additionalInformation, updateAdditionalInformation}: EventBookingFormProps) => {
    const user = useAppSelector(selectors.user.orNull);
    const editingSelf = user && user.loggedIn && targetUser.id === user.id;

    const [sendVerificationEmail, {isUninitialized: verificationNotResent, isSuccess: verifyEmailRequestSucceeded}] = useRequestEmailVerificationMutation();
    const requestVerificationEmail = () => {
        if (user?.loggedIn && user.email) {
            sendVerificationEmail({email: user.email});
        }
    };

    return <>
        {/* Account Information */}
        <Card className="mb-3 bg-light">
            <CardBody>
                <legend>Your account information (<a href="/account" target="_blank" className="text-theme">update</a>)</legend>
                <Row>
                    <Col md={6}>
                        {/* Should be impossible to not have a first name */}
                        <Label htmlFor="account-firstname" className="form-required">
                            First name
                        </Label>
                        <Input id="account-firstname" name="firstname" type="text" disabled value={targetUser.givenName  || ""} />
                    </Col>
                    <Col md={6}>
                        {/* Should be impossible to not have a last name */}
                        <Label htmlFor="account-lastname" className="form-required">
                            Last name
                        </Label>
                        <Input id="account-lastname" name="secondname" type="text" disabled value={targetUser.familyName || ""} />
                    </Col>
                </Row>

                <div>
                    <Row>
                        <Col md={6}>
                            <Label htmlFor="account-email" className="form-required">
                                Email address
                            </Label>
                            <Input id="account-email" name="email" type="email" disabled value={targetUser.email || ""} invalid={targetUser.emailVerificationStatus != 'VERIFIED'} />
                            <FormFeedback>
                                {editingSelf ?
                                    "You must verify your email address to book on events. This is so we can send you details about the event." :
                                    "WARNING: This email is not verified. The details about the event might not reach the user."
                                }
                            </FormFeedback>
                        </Col>
                        {isAda && <Col md={6} className="d-none d-md-block" />}
                        <Col md={6}>
                            <Label htmlFor="account-stages" className="form-required">
                                Stage
                            </Label>
                            <Input id="account-stages" type="text" disabled value={
                                Array.from(new Set(targetUser.registeredContexts?.map(rc => stageLabelMap[rc.stage!]))).join(", ") || ""
                            } />
                        </Col>
                        {isAda && <Col md={6}>
                            <Label htmlFor="account-examboard" className="form-required">
                                Exam board
                            </Label>
                            <Input id="account-examboard" type="text" disabled value={
                                Array.from(new Set(targetUser.registeredContexts?.map(rc => examBoardLabelMap[rc.examBoard!]))).join(", ") || ""
                            } />
                        </Col>}
                    </Row>
                    {editingSelf && <Row>
                        <Col>
                            {targetUser.emailVerificationStatus !== "VERIFIED" && verificationNotResent && <Button
                                color="link" className="btn-underline" onClick={requestVerificationEmail}
                            >
                                Verify your email before booking
                            </Button>}
                            {targetUser.emailVerificationStatus !== "VERIFIED" && verifyEmailRequestSucceeded && <span>
                                We have sent an email to {targetUser.email}. Please follow the instructions in the email prior to booking.
                            </span>}
                        </Col>
                    </Row>}
                </div>
                {editingSelf && <div>
                    <SchoolInput userToUpdate={{...targetUser, password: null}} disableInput submissionAttempted required={!isTutor(targetUser)} />
                </div>}
                {editingSelf && <div className="text-center alert-warning p-1">
                    If this information is incorrect, please update it from your <a href="/account" target="_blank">account page</a>.
                </div>}
            </CardBody>
        </Card>

        {/* Event Booking Details */}
        <Card className="mb-3">
            <CardBody>
                <legend>Event booking details</legend>

                <div>
                    {targetUser.role != 'STUDENT' && <React.Fragment>
                        <Label htmlFor="job-title" className="form-required">Job title</Label>
                        <Input
                            id="job-title" name="job-title" type="text" value={additionalInformation.jobTitle  || ""}
                            onChange={event => updateAdditionalInformation({jobTitle: event.target.value})}
                        />
                        <Label htmlFor="experience-level">Level of teaching experience</Label>
                        <Input
                            id="experience-level" name="experience-level" type="text" value={additionalInformation.experienceLevel  || ""}
                            onChange={event => updateAdditionalInformation({experienceLevel: event.target.value})}
                        />
                    </React.Fragment>}                   
                    {targetUser.role == 'STUDENT' && <React.Fragment>
                        <Label htmlFor="year-group" className="form-required">
                            {/* Based on the options, if only teacher roles are avalable use "Role" */}
                            { !event.isStudentOnly && !event.isAStudentEvent ? "Role" : "School year group" }
                        </Label>
                        <Input
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
                        </Input>
                        {event.isStudentOnly && <div className="text-muted">{studentOnlyEventMessage(event.id)}</div>}
                        {isAda && (event.isATeacherEvent || additionalInformation.yearGroup == 'TEACHER') && <div className="mt-2 text-end">
                            <a href="/pages/teacher_accounts" target="_blank">Click to upgrade to a teacher account</a> for free!
                        </div>}
                    </React.Fragment>}
                </div>

                {<div>
                    <div>
                        <Label htmlFor="medical-reqs">
                            <span className={siteSpecific("d-flex align-items-center", "")}>
                                Dietary requirements or relevant medical conditions
                                <i id="dietary-reqs-help" aria-haspopup="true" className={classNames("ms-2 icon icon-info icon-inline", siteSpecific("icon-color-grey", "icon-color-black"))} />
                            </span>
                            <UncontrolledTooltip placement="bottom" target="dietary-reqs-help">
                                For example, it is important for us to know if you have a severe allergy and/or carry an EpiPen, are prone to fainting, suffer from epilepsy...
                            </UncontrolledTooltip>
                        </Label>
                        <Input
                            id="medical-reqs" name="medical-reqs" type="text" value={additionalInformation.medicalRequirements || ""}
                            onChange={event => updateAdditionalInformation({medicalRequirements: event.target.value})}
                        />
                    </div>

                    <div>
                        <Label htmlFor="access-reqs">
                            <span className={siteSpecific("d-flex align-items-center", "")}>
                                Accessibility requirements
                                <i id="access-reqs-help" aria-haspopup="true" className={classNames("ms-2 icon icon-info icon-inline", siteSpecific("icon-color-grey", "icon-color-black"))} />
                            </span>
                            <UncontrolledTooltip placement="bottom" target="access-reqs-help">
                                For example, please let us know if you need wheelchair access, hearing loop or if we can help with any special adjustments.
                            </UncontrolledTooltip>
                        </Label>
                        <Input
                            id="access-reqs" name="access-reqs" type="text" value={additionalInformation.accessibilityRequirements || ""}
                            onChange={event => updateAdditionalInformation({accessibilityRequirements: event.target.value})}
                        />
                    </div>

                    {additionalInformation.yearGroup != 'TEACHER' && additionalInformation.yearGroup != 'OTHER' && <Row>
                        <Col xs={12}>
                            <h5 className="mt-3">Emergency contact details</h5>
                        </Col>
                        <Col md={6}>
                            <Label htmlFor="emergency-name" className="form-required">
                                Contact name
                            </Label>
                            <Input
                                id="emergency-name" name="emergency-name" type="text" value={additionalInformation.emergencyName || ""}
                                onChange={event => updateAdditionalInformation({emergencyName: event.target.value})}
                            />
                        </Col>
                        <Col md={6}>
                            <Label htmlFor="emergency-number" className="form-required">
                                Contact telephone number
                            </Label>
                            <Input
                                id="emergency-number" name="emergency-number" type="text" value={additionalInformation.emergencyNumber || ""}
                                onChange={event => updateAdditionalInformation({emergencyNumber: event.target.value})}
                            />
                        </Col>
                    </Row>}
                </div>}
            </CardBody>
        </Card>
    </>;
};
