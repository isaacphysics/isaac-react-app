import React, {useEffect, useState} from 'react';
import {
    AppState,
    selectors,
    useAppSelector,
    useGetPageFragmentQuery,
    useLazyGetSchoolByUrnQuery,
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
    isAda,
    isPhy,
    isTeacherOrAbove,
    schoolNameWithPostcode,
    SITE_TITLE, SITE_TITLE_SHORT, siteSpecific,
    validateEmail,
    WEBMASTER_EMAIL
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link} from "react-router-dom";
import {IsaacContent} from "../content/IsaacContent";
import { extractErrorMessage } from '../../services/errors';
import { useTranslation } from 'react-i18next'

const warningFragmentId = "teacher_registration_warning_message";
const nonSchoolDomains = ["@gmail", "@yahoo", "@hotmail", "@sharklasers", "@guerrillamail"];

export const TeacherRequest = () => {
    const { t } = useTranslation()
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
    const [school, setSchool] = useState<string>();
    const [otherInformation, setOtherInformation] = useState("");
    const [verificationDetails, setVerificationDetails] = useState<string>();
    const [messageSent, setMessageSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
    const allowedDomain = isAda || !nonSchoolDomains.some(domain => emailAddress.toLowerCase().includes(domain));

    const urn = user?.loggedIn && user.schoolId || "";
    const subject = t('teacherAccountRequest', 'Teacher Account Request');
    const teacherVerificationMethodMessage = siteSpecific(
        t('aLinkToMySchoolWebsiteWithAStaffListShowingMyNameAndEmailOrAPhoneNumberToContactTheSchoolIs', 'A link to my school website with a staff list showing my name and email (or a phone number to contact the school) is: ') + verificationDetails,
        ""
    );

    const message = t('hello', 'Hello,\n\n') +
        t('pleaseCouldYouConvertMySite_title_shortAccountIntoATeacherAccount', 'Please could you convert my {{SITE_TITLE_SHORT}} account into a teacher account.', { SITE_TITLE_SHORT }) + "\n\n" +
        t('mySchoolIs', 'My school is: ') + school + "\n" +
        teacherVerificationMethodMessage + "\n\n\n" +
        t('anyOtherInformation', 'Any other information: ') + otherInformation + "\n\n" +
        t('thanks', 'Thanks, \n\n') + firstName + " " + lastName;
    const isValidEmail = validateEmail(emailAddress);

    const [getSchoolByUrn] = useLazyGetSchoolByUrnQuery();
    function fetchSchool(urn: string) {
        if (urn !== "") {
            getSchoolByUrn(urn).then(({data}) => {
                if (data && data.length > 0) {
                    setSchool(schoolNameWithPostcode(data[0]));
                }
            });
        } else if (user?.loggedIn && user.schoolOther) {
            setSchool(user.schoolOther);
        } else {
            setSchool(undefined);
        }
    }

    useEffect(() => {
        setFirstName(user?.loggedIn && user.givenName || "");
        setLastName(user?.loggedIn && user.familyName || "");
        setEmailAddress(user?.loggedIn && user.email || "");
        setEmailVerified(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
        fetchSchool(urn);
    }, [user]);

    // Direct private tutors and parents towards the tutor account request page
    const noSchool = <p>
        {t('ifYouDonapostHaveAnAssociatedSchoolPleaseFillOutOur', 'If you don&apos;t have an associated school please fill out our')}
        {" "}<Link to="/contact?preset=teacherRequest">{t('contactUs2', 'Contact us')}</Link>{" "}
        {t('formIfYouAreAPrivateTutorOrParentYouCan', 'form. If you are a private tutor or parent, you can')}
        {" "}<Link to="/tutor_account_request">{t('requestAnSite_titleTutorAccount', 'request an {{SITE_TITLE}} Tutor account', { SITE_TITLE })}</Link>.
    </p>;

    const invalidDetails = siteSpecific(
        !emailVerified || typeof school == "undefined" || !allowedDomain,
        !emailVerified
    );

    return <Container id="contact-page" className="pb-7">
        <TitleAndBreadcrumb currentPageTitle="Teacher Account request" icon={{type: "icon", icon: "icon-account"}}/>
        <div className="pt-4">
            <Row>
                <Col size={9}>
                    {warningFragment && <Alert color="warning">
                        <IsaacContent doc={warningFragment} />
                    </Alert>}
                    <Card>
                        {isTeacherOrAbove(user) &&
                            <Row>
                                <Col className="text-center pt-3">
                                    <span className="h3">
                                        {t('youAlreadyHaveATeacherAccount', 'You already have a teacher account')}
                                    </span>
                                    <p className="mt-3">
                                        {t('goToThe', 'Go to the')} <Link to="/support/teacher/general">{t('teacherFaqPage', 'Teacher FAQ page')}</Link> {t('toLearnAboutYourNewAccountFeatures', 'to learn about your\n                                        new account features.')}
                                    </p>
                                </Col>
                            </Row>
                        }
                        {!isTeacherOrAbove(user) && (messageSent && !errorMessage ?
                            <Row>
                                <Col className="text-center">
                                    <p className="mt-3">
                                        {t('thankYouForSubmittingATeacherAccountRequest', 'Thank you for submitting a teacher account request.')}
                                    </p>
                                    <p>
                                        {t('weWillBeInTouchShortlyPleaseNoteThatAccountVerificationIsAManualProcessAndMayTakeAFewDays', 'We will be in touch shortly. Please note that account verification is a manual\n                                        process and may take a few days.')}
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
                                        {t('toRequestATeacherAccountOnSite_titlePleaseValThisForm', 'To request a teacher account on {{SITE_TITLE}}, please {{val}} this form.', { SITE_TITLE, val: siteSpecific("fill in", "submit") })}
                                        {siteSpecific(
                                            t('youMustUseTheEmailAddressThatWasAssignedToYouByYourSchool', 'You must use the email address that was assigned to you by your school, ') +
                                            t('andTheNameOfYourSchoolShouldBeShownInTheSchoolField', 'and the name of your school should be shown in the \'School\' field. '),
                                            t('youMustUseAVerifiedEmailAddressAndYourFullName', 'You must use a verified email address and your full name. ')
                                        )}
                                        {t('ifAnyOfTheInformationIsIncorrectOrMissingYouCanAmendItOnYour', 'If any of the information is incorrect or missing, you can amend it on your ')}
                                        <Link to="/account">{t('myAccount', 'My account')}</Link>{t('page', ' page.')}
                                        {isPhy && noSchool}
                                    </p>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="first-name-input" className="form-required">{t('firstName', 'First name')}</Label>
                                                <Input disabled id="first-name-input" type="text" name="first-name"
                                                    defaultValue={user?.loggedIn ? user.givenName : ""}
                                                    onChange={e => setFirstName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="last-name-input" className="form-required">{t('lastName', 'Last name')}</Label>
                                                <Input disabled id="last-name-input" type="text" name="last-name"
                                                    defaultValue={user?.loggedIn ? user.familyName : ""}
                                                    onChange={e => setLastName(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="email-input" className="form-required">{t('emailAddress', 'Email address')}</Label>
                                                <Input disabled invalid={!isValidEmail || !emailVerified || !allowedDomain} id="email-input"
                                                    type="email" name="email"
                                                    defaultValue={user?.loggedIn ? user.email : ""}
                                                    onChange={e => setEmailAddress(e.target.value)}
                                                    aria-describedby="emailValidationMessage" required/>
                                            </FormGroup>
                                        </Col>
                                        <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="school-input" className={siteSpecific("form-required", "")}>{t('school', 'School')}</Label>
                                                <Input disabled id="school-input" type="text" name="school"
                                                    defaultValue={school} invalid={isPhy && typeof school == "undefined"}
                                                    onChange={e => setSchool(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        {isPhy && <Col size={12} md={6}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="user-verification-input" className="form-required">{t('urlOfAPageOnYourSchoolWebsiteWhichShowsYourNameAndEmailAddressOrYourSchoolPhoneNumber', 'URL of a page on your school website which shows your name and email address, or your school phone number')}</Label>
                                                <Input id="user-verification-input" type="text" name="user-verification"
                                                    onChange={e => setVerificationDetails(e.target.value)} required/>
                                            </FormGroup>
                                        </Col>}
                                        <Col size={12} md={siteSpecific(6, 12)}>
                                            <FormGroup className="form-group">
                                                <Label htmlFor="other-info-input">{t('anyOtherInformation2', 'Any other information')}</Label>
                                                <Input id="other-info-input" type="textarea" name="other-info"
                                                    onChange={e => setOtherInformation(e.target.value)}/>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    {!emailVerified &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-start">{t('yourEmailAddressIsNotVerifiedPleaseClickOnTheLinkInTheVerificationEmailToConfirmYourEmailAddressYouCan', 'Your email address is not verified —\n                                                please click on the link in the verification email to confirm your\n                                                email address. You can')} <Button color="link primary-font-link" onClick={requestVerificationEmail}>{t('requestANewVerificationEmail3', 'request a\n                                                    new verification email')}</Button> {t('ifNecessary', 'if necessary.')}
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                    {isPhy && typeof school == "undefined" &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-start">
                                                {t('youHaveNotProvidedYourSchoolPleaseAddYourSchoolOnYour', 'You have not provided your school — please add your school on your')}{" "}
                                                <Link to="/account">{t('myAccount2', 'My Account')}</Link> {t('pageIfYouAreAPrivateTutorOrParentYouCan', 'page.\n                                                If you are a private tutor or parent, you can')}{" "}
                                                <Link to="/tutor_account_request">{t('requestAnSite_titleTutorAccount', 'request an {{SITE_TITLE}} Tutor account', { SITE_TITLE })}</Link>.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                    {!allowedDomain &&
                                    <Row>
                                        <Col>
                                            <small className="text-danger text-start">{t('youHaveNotUsedYourSchoolEmailAddressPleaseChangeYourEmailAddressOnYour', 'You have not used your school\n                                            email address — please change your email address on your')} <Link to="/account">{t('myAccount2', 'My Account')}</Link> page.
                                            </small>
                                        </Col>
                                    </Row>
                                    }
                                </CardBody>
                                <CardFooter>
                                    <div>
                                        <Alert color="danger" isOpen={!!errorMessage}><>{t('errormessageYouCanContactUsAt', '{{errorMessage}} You can contact us at', { errorMessage })}<a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a></></Alert>
                                    </div>
                                    <Row>
                                        <Col size={12} md={6}>
                                            <span className="d-block pb-3 pb-md-0 text-end text-md-start form-required">
                                                {t('requiredField', 'Required field')}
                                            </span>
                                        </Col>
                                        <Col size={12} md={6} className="text-end">
                                            <Button type="submit" color="keyline" disabled={invalidDetails} className='w-100'>{t('submit', 'Submit')}</Button>
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
