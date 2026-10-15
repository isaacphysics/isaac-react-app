import React, {useState} from 'react';
import {useGetContentVersionQuery, useGetSegueVersionQuery, useUpdateContentVersionMutation,} from "../../state";
import {Link} from "react-router-dom";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {
    EDITOR_COMPARE_URL,
    isAdmin,
    isAdminOrEventManager,
    isDefined,
    isPhy,
    SITE_TITLE_SHORT,
    siteSpecific
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import {AnonymisationCheckboxes} from "../elements/AnonymisationCheckboxes";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {MisuseStats} from "../elements/MisuseStats";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardTitle,
    Container,
    Form,
    Input,
    InputGroup,
    ListGroup,
    ListGroupItem
} from 'reactstrap';
import { useTranslation } from "react-i18next";

export const Admin = ({user}: {user: RegisteredUserDTO}) => {
    const { t } = useTranslation();
    const {data: segueVersion} = useGetSegueVersionQuery();

    const liveContentVersionQuery = useGetContentVersionQuery();
    const {data: liveContentVersion} = liveContentVersionQuery;

    const [updateContentVersion, {
        isLoading: contentVersionUpdateIsLoading,
        isError: contentVersionUpdateIsError,
        isSuccess: contentVersionUpdateIsSuccess
    }] = useUpdateContentVersionMutation();

    const [newVersion, setNewVersion] = useState<string | null>(null);

    const startVersionUpdate = function(event?: React.FormEvent) {
        if (event) {
            event.preventDefault();
        }
        if (liveContentVersion && newVersion && newVersion !== liveContentVersion) {
            updateContentVersion(newVersion);
        }
    };

    return <Container id="admin-page">
        <TitleAndBreadcrumb
            currentPageTitle={t("common:admin.title", { siteTitle: SITE_TITLE_SHORT })} breadcrumbTitleOverride={t("common:admin.breadcrumbTitle")}
            icon={{"type": "icon", "icon": "icon-account"}}
        />

        <div className="py-4">

            {t("common:admin.greeting", { givenName: user.givenName })}

            <Card className="p-3 my-3">
                <CardTitle tag="h2">{t("common:admin.usefulLinks.title")}</CardTitle>
                <ListGroup className="flex-row border-0">
                    <ListGroupItem className="w-auto border-0"><Link to="/admin/usermanager">{t("common:admin.usefulLinks.userManager")}</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/admin/emails">{t("common:admin.usefulLinks.adminEmails")}</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/equality">{t("common:admin.usefulLinks.equationBuilder")}</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/free_text">{t("common:admin.usefulLinks.freeTextBuilder")}</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/markdown">{t("common:admin.usefulLinks.markdownBuilder")}</Link></ListGroupItem>
                </ListGroup>
            </Card>

            <Card className="p-3 mb-3">
                <CardTitle tag="h2">{t("common:admin.console.title")}</CardTitle>
                <CardBody>
                    <ul>
                        <li><strong>{t("common:admin.console.apiVersionLabel")}</strong> {segueVersion}</li>
                    </ul>
                </CardBody>
            </Card>

            <Card className="p-3 mb-3">
                <CardTitle tag="h2">{t("common:admin.tools.title")}</CardTitle>
                <CardBody>
                    <h3>{t("common:admin.content.title")}</h3>
                    <ShowLoadingQuery
                        defaultErrorTitle={t("common:admin.content.errorLoading")}
                        query={liveContentVersionQuery}
                        thenRender={liveContentVersion => {
                            const displayVersion = newVersion || liveContentVersion || null;
                            return <>
                                <strong>{t("common:admin.content.liveVersionLabel")}</strong>
                                {isDefined(displayVersion) && !contentVersionUpdateIsLoading &&
                                    <Form onSubmit={startVersionUpdate}>
                                        <InputGroup className={"separate-input-group"}>
                                            <Input
                                                aria-label={t("common:admin.content.inputAriaLabel")}
                                                type="text" value={displayVersion}
                                                onChange={e => setNewVersion(e.target.value)}
                                                placeholder={t("common:admin.content.inputPlaceholder")}
                                                className={siteSpecific("", "h-100")}
                                            />
                                            <a
                                                className={classnames("btn btn-secondary", {
                                                    "px-2 d-flex align-items-center": isPhy,
                                                    "disabled": displayVersion === liveContentVersion
                                                })}
                                                href={`${EDITOR_COMPARE_URL}/${liveContentVersion}/${displayVersion}`}
                                                target="_blank" rel="noopener"
                                            >
                                                {t("common:admin.content.previewButton")}
                                            </a>
                                            <Button
                                                type="button"
                                                onClick={startVersionUpdate}
                                                disabled={!isAdminOrEventManager(user) || displayVersion === liveContentVersion}
                                            >
                                                {t("common:admin.content.setVersionButton")}
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                }
                                {contentVersionUpdateIsLoading &&
                                    <Alert color="info">
                                        <div className="h4">{t("common:admin.content.updatingTitle")}</div>
                                        <p>{t("common:admin.content.updatingMessage", { currentVersion: liveContentVersion, newVersion })}</p>
                                        <IsaacSpinner />
                                    </Alert>
                                }
                                {contentVersionUpdateIsSuccess &&
                                    <Alert color="success">
                                        <div className="h4">{t("common:admin.content.successMessage")}</div>
                                    </Alert>
                                }
                                {contentVersionUpdateIsError &&
                                    <Alert color="danger">
                                        <div className="h4">{t("common:admin.content.errorMessage")}</div>
                                    </Alert>
                                }
                            </>;
                        }}
                    />
                    <h3 className="mt-3">{t("common:admin.demonstration.title")}</h3>
                    <AnonymisationCheckboxes/>

                    {isAdmin(user) && <>
                        <h3 className="mt-3">{t("common:admin.misuse.title")}</h3>
                        <MisuseStats/>
                    </>}
                </CardBody>
            </Card>
        </div>
    </Container>;
};
