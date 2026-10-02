import React, {useEffect, useState} from 'react';
import {
    AppState,
    selectors,
    useAppSelector,
    useGetPageFragmentQuery,
    useRequestEmailVerificationMutation,
    useSubmitContactFormMutation
} from "../../state";
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    Container,
    Form,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";
import {
    isPhy,
    isTutorOrAbove,
    selectOnChange,
    SITE_TITLE, SITE_TITLE_SHORT,
    tags,
    validateEmail,
    WEBMASTER_EMAIL
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link} from "react-router-dom";
import {IsaacContent} from "../content/IsaacContent";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {extractErrorMessage} from '../../services/errors';
import { Trans, useTranslation } from "react-i18next";

const warningFragmentId = "teacher_registration_warning_message"; // TUTOR have decided to keep this message

export const TutorRequest = () => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);
    const error = useAppSelector((state: AppState) => state?.error);
    const errorMessage = extractErrorMessage(error);
    const {data: warningFragment} = useGetPageFragmentQuery(warningFragmentId);
    const [submitContactForm] = useSubmitContactFormMutation();

    const [sendVerificationEmail] = useRequestEmailVerificationMutation();
    const requestVerificationEmail = () => {
        if (user?.loggedIn && user.email) {
            sendVerificationEmail({email: user.email});
        }
    };

    const [firstName, setFirstName] = useState(user?.loggedIn && user.givenName || "");
    const [lastName, setLastName] = useState(user?.loggedIn && user.familyName || "");
    const [emailAddress, setEmailAddress] = useState(user?.loggedIn && user.email || "");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [reason, setReason] = useState<string>("");
    const [messageSent, setMessageSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));

    const subject = "Tutor Account Request";
    const message = "Hello,\n\n" +
        `Please could you convert my ${SITE_TITLE_SHORT} account into a tutor account.` + "\n\n" +
        (subjects.length > 0 ? ("I would like to teach subjects: " + subjects.join(", ") + "\n\n") : "") +
        (reason ? "I would like to upgrade because: " + reason + "\n\n" : "") +
        "Thanks, \n\n" + firstName + " " + lastName;
    const isValidEmail = validateEmail(emailAddress);

    useEffect(() => {
        setFirstName(user?.loggedIn && user.givenName || "");
        setLastName(user?.loggedIn && user.familyName || "");
        setEmailAddress(user?.loggedIn && user.email || "");
        setEmailVerified(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
    }, [user]);

    return <Container id="contact-page" className="pb-7">
        <TitleAndBreadcrumb currentPageTitle={t("common:account.tutorRequest.title")} icon={{type: "icon", icon: "icon-account"}}/>
        <div className="pt-4">
            <Row>
                <Col size={9}>
                    {warningFragment && <Alert color="warning">
                        <IsaacContent doc={warningFragment} />
                    </Alert>}
                    <Card>
                        {isTutorOrAbove(user) &&
                            <Row>
                                <Col className="text-center pt-3">
                                    <span className="h3 mb-3 d-inline-block">
                                        {t("common:account.tutorRequest.alreadyTutor")}
                                    </span>
                                    {isPhy && <p className="mb-2">
                                        <Trans i18nKey="sci:account.tutorRequest.tutorFeaturesLink" components={{ tutorFeaturesLink: <Link to="/tutor_features" /> }} />
                                    </p>}
                                </Col>
                            </Row>
                        }
                        {!isTutorOrAbove(user) && (messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <p className="mt-3">
                                        {t("common:account.tutorRequest.submittedThanks")}
                                    </p>
                                    <p>
                                        {t("common:account.tutorRequest.submittedNote")}
                                    </p>
                                </Col>
                            </Row>
                            :
                            <Form name="contact" onSubmit={e => {
                                e.preventDefault();
                                submitContactForm({firstName, lastName, emailAddress, subject, message});
                                setMessageSent(true);
                            }}>
                                <CardBody>
                                    <p>
                                        <Trans i18nKey="common:account.tutorRequest.formIntro" components={{ accountLink: <Link to="/account" /> }} values={{ siteTitle: `To request a tutor account on ${SITE_TITLE}, please fill in this form. ` }} />
                                    </p>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="first-name-input" className="form-required">{t("common:account.tutorRequest.firstNameLabel")}</Label>
                                                <Input disabled id="first-name-input" type="text" name="first-name"
                                                    defaultValue={user?.loggedIn ? user.givenName : ""}
                                                    onChange={e => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="last-name-input" className="form-required">{t("common:account.tutorRequest.lastNameLabel")}</Label>
                                                <Input disabled id="last-name-input" type="text" name="last-name"
                                                    defaultValue={user?.loggedIn ? user.familyName : ""}
                                                    onChange={e => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={isPhy ? 6 : undefined}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="email-input" className="form-required">{t("common:account.tutorRequest.emailLabel")}</Label>
                                                <Input disabled invalid={!isValidEmail || !emailVerified} id="email-input"
                                                    type="email" name="email"
                                                    defaultValue={user?.loggedIn ? user.email : ""}
                                                    onChange={e => setEmailAddress(e.target.value)}
                                                    aria-describedby="emailValidationMessage" required/>
                                            </FormGroup>
                                        </Col>
                                        {isPhy && <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="subject-input">{t("common:account.tutorRequest.subjectsLabel")}</Label>
                                                <StyledSelect
                                                    inputId="subject-input"
                                                    placeholder={t("common:account.tutorRequest.subjectsPlaceholder")}
                                                    isClearable
                                                    isMulti
                                                    onChange={selectOnChange(setSubjects, true)}
                                                    options={tags.allSubjectTags.map(tag => ({value: tag.title, label: tag.title}))}
                                                />
                                            </FormGroup>
                                        </Col>}
                                    </Row>
                                    <Row>
                                        <Col size={12}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="other-info-input" className="form-required">
                                                    {t("common:account.tutorRequest.reasonLabel")}
                                                </Label>
                                                <Input id="other-info-input" type="textarea" name="other-info" required
                                                    onChange={e => setReason(e.target.value)}/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {!emailVerified &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-start">Your email address is not verified –
                                                please click on the link in the verification email to confirm your
                                                email address. You can <Button color="link primary-font-link" onClick={requestVerificationEmail}>request a
                                                new verification email</Button> if necessary.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                </CardBody>
                                <CardFooter>
                                    <div>
                                        <Alert color="danger" isOpen={!!errorMessage}><>{/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:account.tutorRequest.errorContact" components={{ emailLink: <a href={`mailto:${WEBMASTER_EMAIL}`} /> }} values={{ errorMessage, emailAddress: WEBMASTER_EMAIL }} />{/* eslint-enable jsx-a11y/anchor-has-content */}</></Alert>
                                    </div>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <span className="d-block pb-3 pb-md-0 text-end text-md-start form-required">
                                                {t("common:account.tutorRequest.requiredField")}
                                            </span>
                                        </Col>
                                        <Col size={12} md={6} className="text-end">
                                            <Button type="submit" color="keyline" disabled={!emailVerified} className='w-100'>{t("common:account.tutorRequest.submitButton")}</Button>
                                        </Col>
                                    </Row>
                                </CardFooter>
                            </Form>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    </Container>;
};
