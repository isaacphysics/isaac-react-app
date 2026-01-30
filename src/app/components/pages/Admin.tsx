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

export const Admin = ({user}: {user: RegisteredUserDTO}) => {
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
            currentPageTitle={`${SITE_TITLE_SHORT} administration`} breadcrumbTitleOverride="Admin tools"
            icon={{"type": "icon", "icon": "icon-account"}}
        />

        <div className="py-4">

            Hi, {user.givenName}!

            <Card className="p-3 my-3">
                <CardTitle tag="h2">Useful links</CardTitle>
                <ListGroup className="flex-row border-0">
                    <ListGroupItem className="w-auto border-0"><Link to="/admin/usermanager">User Manager</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/admin/emails">Admin emails</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/equality">Equation builder</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/free_text">Free-text builder</Link></ListGroupItem>
                    <ListGroupItem className="w-auto border-0"><Link to="/markdown">Markdown builder</Link></ListGroupItem>
                </ListGroup>
            </Card>

            <Card className="p-3 mb-3">
                <CardTitle tag="h2">Admin Console</CardTitle>
                <CardBody>
                    <ul>
                        <li><strong>API Version:</strong> {segueVersion}</li>
                    </ul>
                </CardBody>
            </Card>

            <Card className="p-3 mb-3">
                <CardTitle tag="h2">Administrative tools</CardTitle>
                <CardBody>
                    <h3>Manage site content</h3>
                    <ShowLoadingQuery
                        defaultErrorTitle={"Error loading content version"}
                        query={liveContentVersionQuery}
                        thenRender={liveContentVersion => {
                            const displayVersion = newVersion || liveContentVersion || null;
                            return <>
                                <strong>Live Content Version</strong>
                                {isDefined(displayVersion) && !contentVersionUpdateIsLoading &&
                                    <Form onSubmit={startVersionUpdate}>
                                        <InputGroup className={"separate-input-group"}>
                                            <Input
                                                aria-label="Live content commit SHA"
                                                type="text" value={displayVersion}
                                                onChange={e => setNewVersion(e.target.value)}
                                                placeholder="Enter commit SHA"
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
                                                Preview Changes
                                            </a>
                                            <Button
                                                type="button"
                                                onClick={startVersionUpdate}
                                                disabled={!isAdminOrEventManager(user) || displayVersion === liveContentVersion}
                                            >
                                                Set Version
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                }
                                {contentVersionUpdateIsLoading &&
                                    <Alert color="info">
                                        <h4>Updating...</h4>
                                        <p>Replacing version {liveContentVersion} with {newVersion}</p>
                                        <IsaacSpinner />
                                    </Alert>
                                }
                                {contentVersionUpdateIsSuccess &&
                                    <Alert color="success">
                                        <h4>Content version changed successfully.</h4>
                                    </Alert>
                                }
                                {contentVersionUpdateIsError &&
                                    <Alert color="danger">
                                        <h4>Error: Content version could not be changed.</h4>
                                    </Alert>
                                }
                            </>;
                        }}
                    />
                    <h3 className={"mt-3"}>Demonstration Mode</h3>
                    <AnonymisationCheckboxes/>

                    {isAdmin(user) && <>
                        <h3 className={"mt-3"}>Misuse statistics</h3>
                        <MisuseStats/>
                    </>}
                </CardBody>
            </Card>
        </div>
    </Container>;
};
