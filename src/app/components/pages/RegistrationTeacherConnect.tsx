import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Row
} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {extractTeacherName, isAda, KEY, persistence, SITE_TITLE, siteSpecific} from "../../services";
import {
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetActiveAuthorisationsQuery,
    useLazyGetTokenOwnerQuery
} from "../../state";
import { authenticateWithTokenAfterPrompt } from "../elements/panels/TeacherConnections";
import { useNavigate } from "react-router";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { Trans, useTranslation } from "react-i18next";

export const RegistrationTeacherConnect = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const navigate = useNavigate();

    const [getTokenOwner] = useLazyGetTokenOwnerQuery();
    const [authenticationToken, setAuthenticationToken] = useState<string | undefined>("");
    const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

    const {data: activeAuthorisations} = useGetActiveAuthorisationsQuery(user && user.loggedIn && user.id || undefined);

    const codeIsValid = authenticationToken && authenticationToken.length > 0;

    function submit(event: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        setSubmissionAttempted(true);
        if (user && user.loggedIn && user.id && codeIsValid) {
            void authenticateWithTokenAfterPrompt(user.id, authenticationToken, dispatch, getTokenOwner);
        }
    }

    const continueToNext = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate(siteSpecific("/register/preferences", "/register/success"));
    };

    useEffect(() => {
        // If the AFTER_AUTH_PATH is a teacher connection URL, we'll deal with it here instead.
        const afterAuthPath = persistence.load(KEY.AFTER_AUTH_PATH);
        if (afterAuthPath && afterAuthPath.includes("authToken")) {
            setAuthenticationToken(afterAuthPath.split("?authToken=").at(-1)?.toUpperCase().replace(/ /g,''));
            persistence.remove(KEY.AFTER_AUTH_PATH);
        }
    }, []);


    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:auth.teacherConnect.title", { siteTitle: SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}}/>
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={4}/>,
            undefined
        )}
    >
        <Card className={"my-7"}>
            <CardBody>
                <Form onSubmit={submit}>
                    <h3>{t("common:auth.teacherConnect.heading")}</h3>
                    {siteSpecific(
                        <>
                            <p>{/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="sci:auth.teacherConnect.groupInfo" components={{ learnMoreLink: <a href="/support/student/homework#join_group" target="_blank" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}</p>
                            <p>{t("sci:auth.teacherConnect.skipNote")}</p>
                        </>,
                        <>
                            <p>{/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="ada:auth.teacherConnect.groupInfo" components={{ learnMoreLink: <a href="/support/student/general" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}</p>
                            <p>{t("ada:auth.teacherConnect.skipNote")}</p>
                        </>
                    )}
                    <Col xs={12} lg={6}>
                        <FormGroup className="form-group">
                            <Label className={"fw-bold"} htmlFor="connect-code-input">{t("common:auth.teacherConnect.codeLabel")}</Label>
                            {isAda && <p className={"input-description"}>{t("ada:auth.teacherConnect.codeHelp")}</p>}
                            <InputGroup className={"separate-input-group mb-4 d-flex flex-row align-items-center"}>
                                <Input
                                    id="connect-code-input"
                                    type="text"
                                    name="connect-code"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                                    invalid={submissionAttempted && !codeIsValid}
                                    aria-describedby="codeValidationMessage"
                                    value={authenticationToken}
                                />
                                <div className="input-group-append">
                                    <Button disabled={!codeIsValid} onClick={submit} color="keyline">
                                        {t("common:auth.teacherConnect.connectButton")}
                                    </Button>
                                </div>
                            </InputGroup>
                            <FormFeedback id="codeValidationMessage">
                                {t("common:auth.teacherConnect.codeError")}
                            </FormFeedback>
                        </FormGroup>
                        {activeAuthorisations && activeAuthorisations.length > 0 &&
                            <div className="mb-3">
                                <h5>{t("common:auth.teacherConnect.connectedTeachers")}</h5>
                                <ul>
                                    {activeAuthorisations.map((auth) => (
                                        <li key={auth.id}>{extractTeacherName(auth)} - ({auth.email})</li>
                                    ))}
                                </ul>
                            </div>
                        }
                    </Col>
                    <hr />
                    <Row className="justify-content-end">
                        {siteSpecific(
                            <>
                                <Col xs={6} md={4} lg={3}>
                                    <Button className="w-100 my-2 px-2" color="keyline" onClick={continueToNext}>{t("common:auth.teacherConnect.skipButton")}</Button>
                                </Col>
                                <Col xs={6} md={4} lg={3}>
                                    <Button className="w-100 my-2 px-2" color="solid" disabled={!activeAuthorisations?.length} onClick={continueToNext}>{t("common:auth.teacherConnect.continueButton")}</Button>
                                </Col>
                            </>, 
                            <>
                                <Col xs={6} md={4} lg={3}>
                                    <Button className="w-100 my-2 px-2" color="solid" onClick={continueToNext}>{t("common:auth.teacherConnect.continueButton")}</Button>
                                </Col>
                            </>
                        )}
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </PageContainer>;
};
