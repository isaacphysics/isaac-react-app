import React, {useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";
import {confirmThen, isAda, SITE_LOWER_AGE_LIMIT, SITE_LOWER_AGE_LIMIT_WITHOUT_PARENTAL_CONSENT, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classNames from "classnames";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { useTranslation } from "react-i18next";

type AgePermission = "denied" | "additional_info" | "sso_only" | "allowed";

export const RegistrationAgeCheck = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const [agePermission, setAgePermission] = useState<AgePermission | undefined>(undefined);
    const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmissionAttempted(true);

        switch (agePermission) {
            case "allowed":
                void navigate("/register/student/details");
                break;
            case "additional_info":
                void navigate("/register/student/additional_info");
                break;
            case "sso_only":
                void navigate("/register/student/sso_only");
                break;
            case "denied":
                void navigate("/register/student/age_denied");
                break;
        }
    };

    const goBack = () => {
        confirmThen(
            t("common:auth.registration.ageCheck.goBackConfirm"),
            () => navigate("/register"));
    };

    const isInvalid = submissionAttempted && agePermission === undefined;

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:auth.registration.pageTitle", { siteTitle: SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={1}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                <h2 className={siteSpecific("h4", "h3")}>{t("common:auth.registration.ageCheck.ageQuestion")}</h2>
                <p>{t("common:auth.registration.ageCheck.terms", { minAge: SITE_LOWER_AGE_LIMIT })}</p>
                <Form onSubmit={submit}>
                    <fieldset>
                        <FormGroup check className="d-flex align-items-center my-2">
                            <Input
                                id="registration-age-check-over"
                                className={classNames("d-inline", {"mb-1" : isAda})}
                                type="radio"
                                checked={agePermission === "allowed"}
                                onChange={() => {setAgePermission("allowed");}}
                                color="primary"
                                invalid={isInvalid}
                            />
                            <Label for="registration-age-check-over" className="ms-2 mb-0">{t("common:auth.registration.ageCheck.optionOver", { minAgeWithConsent: SITE_LOWER_AGE_LIMIT_WITHOUT_PARENTAL_CONSENT })}</Label>
                        </FormGroup>
                        <FormGroup check className="d-flex align-items-center my-2">
                            <Input
                                id={`registration-age-check-${siteSpecific("additional_info", "sso_only")}`}
                                className={classNames("d-inline", {"mb-1" : isAda})}
                                type="radio"
                                checked={agePermission === siteSpecific("additional_info", "sso_only")}
                                onChange={() => {setAgePermission(siteSpecific("additional_info", "sso_only"));}}
                                color="primary"
                                invalid={isInvalid}
                            />
                            <Label for={`registration-age-check-${siteSpecific("additional_info", "sso_only")}`} className="ms-2 mb-0">{t("common:auth.registration.ageCheck.optionBetween", { minAge: SITE_LOWER_AGE_LIMIT, maxAgeWithConsent: SITE_LOWER_AGE_LIMIT_WITHOUT_PARENTAL_CONSENT - 1 })}</Label>
                        </FormGroup>
                        <FormGroup check className="my-2">
                            <Input
                                id="registration-age-check-under"
                                className={classNames("d-inline", {"mb-1" : isAda})}
                                type="radio"
                                checked={agePermission === "denied"}
                                onChange={() => {setAgePermission("denied");}}
                                color="primary"
                                invalid={isInvalid}
                            />
                            <Label for="registration-age-check-under" className="ms-2 mb-0">{t("common:auth.registration.ageCheck.optionUnder", { maxAge: SITE_LOWER_AGE_LIMIT - 1 })}</Label>
                        </FormGroup>
                        <FormFeedback className={classNames({"d-block": isInvalid})}>
                            {t("common:auth.registration.ageCheck.selectionRequired")}
                        </FormFeedback>
                    </fieldset>
                    {isAda && <hr/>}
                    <Row className="justify-content-end">
                        <Col sm={siteSpecific(3,4)} lg={3} className="d-flex justify-content-end mb-1 mb-sm-0">
                            <Button className="w-100 h-100" color="keyline" onClick={goBack}>{t("common:button.back")}</Button>
                        </Col>
                        <Col sm={siteSpecific(4,5)} lg={3}>
                            <Button type="submit" color="solid" className="w-100 h-100">{t("common:button.continue")}</Button>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </PageContainer>;
};
