import React from "react";
import {AdditionalInformation, AugmentedEvent} from "../../../IsaacAppTypes";
import {SchoolInput} from "./inputs/SchoolInput";
import {selectors, useAppSelector, useRequestEmailVerificationMutation} from "../../state";
import {UserSummaryWithEmailAddressDTO} from "../../../IsaacApiTypes";
import {examBoardLabelMap, isAda, isTutor, siteSpecific, stageLabelMap, studentOnlyEventMessage} from "../../services";
import {Immutable} from "immer";
import { Card, CardBody, Row, Col, Label, Input, FormFeedback, Button, UncontrolledTooltip } from "reactstrap";
import classNames from "classnames";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "./TransAnchor";

interface EventBookingFormProps {
    event: AugmentedEvent;
    targetUser: Immutable<UserSummaryWithEmailAddressDTO>;
    additionalInformation: AdditionalInformation;
    updateAdditionalInformation: (update: AdditionalInformation) => void;
}

export const EventBookingForm = ({event, targetUser, additionalInformation, updateAdditionalInformation}: EventBookingFormProps) => {
    const { t } = useTranslation();
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
        <Card className="mb-3 bg-neutral-light">
            <CardBody>
                <legend><Trans
                    i18nKey="common:events.booking.accountSection"
                    components={{
                        accountLink: <TransAnchor href="/account" target="_blank" className="text-theme" />,
                    }}
                /></legend>
                <Row>
                    <Col md={6}>
                        {/* Should be impossible to not have a first name */}
                        <Label htmlFor="account-firstname" className="form-required">
                            {t("common:events.booking.firstName")}
                        </Label>
                        <Input id="account-firstname" name="firstname" type="text" disabled value={targetUser.givenName  || ""} />
                    </Col>
                    <Col md={6}>
                        {/* Should be impossible to not have a last name */}
                        <Label htmlFor="account-lastname" className="form-required">
                            {t("common:events.booking.lastName")}
                        </Label>
                        <Input id="account-lastname" name="secondname" type="text" disabled value={targetUser.familyName || ""} />
                    </Col>
                </Row>

                <div>
                    <Row>
                        <Col md={6}>
                            <Label htmlFor="account-email" className="form-required">
                                {t("common:events.booking.email")}
                            </Label>
                            <Input id="account-email" name="email" type="email" disabled value={targetUser.email || ""} invalid={targetUser.emailVerificationStatus != 'VERIFIED'} />
                            <FormFeedback>
                                {editingSelf ?
                                    t("common:events.booking.emailVerifySelf") :
                                    t("common:events.booking.emailVerifyOther")
                                }
                            </FormFeedback>
                        </Col>
                        {isAda && <Col md={6} className="d-none d-md-block" />}
                        <Col md={6}>
                            <Label htmlFor="account-stages" className="form-required">
                                {t("common:events.booking.stage")}
                            </Label>
                            <Input id="account-stages" type="text" disabled value={
                                Array.from(new Set(targetUser.registeredContexts?.map(rc => stageLabelMap[rc.stage!]))).join(", ") || ""
                            } />
                        </Col>
                        {isAda && <Col md={6}>
                            <Label htmlFor="account-examboard" className="form-required">
                                {t("ada:events.booking.examBoard")}
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
                                {t("common:events.booking.verifyEmailBtn")}
                            </Button>}
                            {targetUser.emailVerificationStatus !== "VERIFIED" && verifyEmailRequestSucceeded && <span>
                                {t("common:events.booking.emailSent", { email: targetUser.email })}
                            </span>}
                        </Col>
                    </Row>}
                </div>
                {editingSelf && <div>
                    <SchoolInput userToUpdate={{...targetUser, password: null}} disableInput submissionAttempted required={!isTutor(targetUser)} />
                </div>}
                {editingSelf && <div className="text-center alert-warning p-1">
                    <Trans
                        i18nKey="common:events.booking.updateInfo"
                        components={{
                            accountLink: <TransAnchor href="/account" target="_blank" />,
                        }}
                    />
                </div>}
            </CardBody>
        </Card>

        {/* Event Booking Details */}
        <Card className="mb-3">
            <CardBody>
                <legend>{t("common:events.booking.detailsTitle")}</legend>

                <div>
                    {targetUser.role != 'STUDENT' && <React.Fragment>
                        <Label htmlFor="job-title" className="form-required">{t("common:events.booking.jobTitle")}</Label>
                        <Input
                            id="job-title" name="job-title" type="text" value={additionalInformation.jobTitle  || ""}
                            onChange={event => updateAdditionalInformation({jobTitle: event.target.value})}
                        />
                        <Label htmlFor="experience-level">{t("common:events.booking.experience")}</Label>
                        <Input
                            id="experience-level" name="experience-level" type="text" value={additionalInformation.experienceLevel  || ""}
                            onChange={event => updateAdditionalInformation({experienceLevel: event.target.value})}
                        />
                    </React.Fragment>}                   
                    {targetUser.role == 'STUDENT' && <React.Fragment>
                        <Label htmlFor="year-group" className="form-required">
                            {/* Based on the options, if only teacher roles are avalable use "Role" */}
                            { !event.isStudentOnly && !event.isAStudentEvent ? t("common:events.booking.role") : t("common:events.booking.yearGroup") }
                        </Label>
                        <Input
                            type="select" id="year-group" name="year-group" value={additionalInformation.yearGroup || ""}
                            onChange={event => updateAdditionalInformation({yearGroup: event.target.value})}
                        >
                            <option value="" />
                            {event.isAStudentEvent && <option value="9">{t("common:events.booking.year9")}</option>}
                            {event.isAStudentEvent && <option value="10">{t("common:events.booking.year10")}</option>}
                            {event.isAStudentEvent && <option value="11">{t("common:events.booking.year11")}</option>}
                            {event.isAStudentEvent && <option value="12">{t("common:events.booking.year12")}</option>}
                            {event.isAStudentEvent && <option value="13">{t("common:events.booking.year13")}</option>}
                            {!event.isStudentOnly && <option value="TEACHER">{t("common:events.booking.naTeacher")}</option>}
                            {!event.isStudentOnly && <option value="OTHER">{t("common:events.booking.naOther")}</option>}
                        </Input>
                        {event.isStudentOnly && <div className="text-muted">{studentOnlyEventMessage(event.id)}</div>}
                        {isAda && (event.isATeacherEvent || additionalInformation.yearGroup == 'TEACHER') && <div className="mt-2 text-end">
                            <Trans
                                i18nKey="common:events.booking.upgradeLink"
                                components={{
                                    teacherAccountLink: <TransAnchor href="/pages/teacher_accounts" target="_blank" />,
                                }}
                            />
                        </div>}
                    </React.Fragment>}
                </div>

                {<div>
                    <div>
                        <Label htmlFor="medical-reqs">
                            <span className={siteSpecific("d-flex align-items-center", "")}>
                                {t("common:events.booking.dietary")}
                                <i id="dietary-reqs-help" aria-haspopup="true" className={classNames("ms-2 icon icon-info icon-inline", siteSpecific("icon-color-grey", "icon-color-black"))} />
                            </span>
                            <UncontrolledTooltip placement="bottom" target="dietary-reqs-help">
                                {t("common:events.booking.dietaryHelp")}
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
                                {t("common:events.booking.accessibility")}
                                <i id="access-reqs-help" aria-haspopup="true" className={classNames("ms-2 icon icon-info icon-inline", siteSpecific("icon-color-grey", "icon-color-black"))} />
                            </span>
                            <UncontrolledTooltip placement="bottom" target="access-reqs-help">
                                {t("common:events.booking.accessibilityHelp")}
                            </UncontrolledTooltip>
                        </Label>
                        <Input
                            id="access-reqs" name="access-reqs" type="text" value={additionalInformation.accessibilityRequirements || ""}
                            onChange={event => updateAdditionalInformation({accessibilityRequirements: event.target.value})}
                        />
                    </div>

                    {additionalInformation.yearGroup != 'TEACHER' && additionalInformation.yearGroup != 'OTHER' && <Row>
                        <Col xs={12}>
                            <div className="mt-3 h5">{t("common:events.booking.emergency")}</div>
                        </Col>
                        <Col md={6}>
                            <Label htmlFor="emergency-name" className="form-required">
                                {t("common:events.booking.emergencyName")}
                            </Label>
                            <Input
                                id="emergency-name" name="emergency-name" type="text" value={additionalInformation.emergencyName || ""}
                                onChange={event => updateAdditionalInformation({emergencyName: event.target.value})}
                            />
                        </Col>
                        <Col md={6}>
                            <Label htmlFor="emergency-number" className="form-required">
                                {t("common:events.booking.emergencyPhone")}
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
