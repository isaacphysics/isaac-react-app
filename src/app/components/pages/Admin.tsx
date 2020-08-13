import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {getContentVersion, mergeUsers, requestConstantsSegueVersion, setContentVersion} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {ContentVersionUpdatingStatus, EDITOR_COMPARE_URL} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {selectors} from "../../state/selectors";
import classnames from "classnames";
import {FormGroup} from "reactstrap";

export const Admin = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useDispatch();
    const segueVersion = useSelector(selectors.segue.versionOrUnknown);
    const contentVersion = useSelector(selectors.segue.contentVersion);
    useEffect(() => {
        dispatch(getContentVersion());
        dispatch(requestConstantsSegueVersion());
    }, [dispatch]);

    const [newVersion, setNewVersion] = useState<string | null>(null);
    const [mergeTargetId, setMergeTargetId] = useState<string>("");
    const [mergeSourceId, setMergeSourceId] = useState<string>("");

    const displayVersion = newVersion || (contentVersion && contentVersion.liveVersion) || null;

    const startVersionUpdate = function(event?: React.FormEvent) {
        if (event) {
            event.preventDefault();
        }
        if (contentVersion && displayVersion !== contentVersion.liveVersion && newVersion != null) {
            dispatch(setContentVersion(newVersion));
        }
    };

    const startMergeUsers = () => {
        dispatch(mergeUsers(Number(mergeTargetId), Number(mergeSourceId)))
    }

    const updateState = contentVersion && contentVersion.updateState || null;

    return <RS.Container id="admin-page">
        <TitleAndBreadcrumb currentPageTitle="Isaac administration" breadcrumbTitleOverride="Admin tools" />

        <div className="py-4">

            Hi, {user.givenName}!

            <RS.Card className="p-3 my-3">
                <RS.CardTitle tag="h2">Useful links</RS.CardTitle>
                <RS.ListGroup className="flex-row">
                    <RS.ListGroupItem className="w-auto"><Link to="/admin/usermanager">User Manager</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/admin/emails">Admin emails</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/equality">Equation builder</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/free_text">Free-text builder</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/markdown">Markdown builder</Link></RS.ListGroupItem>
                </RS.ListGroup>
            </RS.Card>

            <RS.Card className="p-3 mb-3">
                <RS.CardTitle tag="h2">Admin Console</RS.CardTitle>
                <RS.CardBody>
                    <ul>
                        <li><strong>API Version:</strong> {segueVersion}</li>
                    </ul>
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="p-3 mb-3">
                <RS.CardTitle tag="h2">Administrative tools</RS.CardTitle>
                <RS.CardBody>
                    <h3>Manage site content</h3>
                    {contentVersion && <React.Fragment>
                        <div>
                            <strong>Live Content Version</strong>
                        </div>
                        <ShowLoading until={displayVersion !== null} thenRender={() => {
                            return displayVersion !== null && updateState != ContentVersionUpdatingStatus.UPDATING &&
                                <RS.Form onSubmit={startVersionUpdate}>
                                    <RS.InputGroup>
                                        <RS.Input
                                            aria-label="Live content commit SHA"
                                            type="text" value={displayVersion}
                                            onChange={e => setNewVersion(e.target.value)}
                                            placeholder="Enter commit SHA"
                                        />
                                        <RS.InputGroupAddon addonType="append">
                                            <a
                                                className={classnames({
                                                    "p-1 border-dark btn btn-secondary": true,
                                                    "disabled": displayVersion === contentVersion.liveVersion
                                                })}
                                                href={`${EDITOR_COMPARE_URL}/${contentVersion?.liveVersion}/${displayVersion}`}
                                                target="_blank" rel="noopener"
                                            >
                                                Preview Changes
                                            </a>
                                        </RS.InputGroupAddon>
                                        <RS.InputGroupAddon addonType="append">
                                            <RS.Button
                                                type="button" className="p-0 border-dark"
                                                onClick={startVersionUpdate}
                                                disabled={user.role != "ADMIN" || displayVersion === contentVersion.liveVersion}
                                            >
                                                Set Version
                                            </RS.Button>
                                        </RS.InputGroupAddon>
                                    </RS.InputGroup>
                                </RS.Form>
                        }} />
                        {updateState == ContentVersionUpdatingStatus.UPDATING &&
                            <RS.Alert color="info">
                                <h4>Updating...</h4>
                                <p>Replacing version {contentVersion.liveVersion} with {contentVersion.updatingVersion}</p>
                                <RS.Spinner />
                            </RS.Alert>
                        }
                        {updateState == ContentVersionUpdatingStatus.SUCCESS &&
                            <RS.Alert color="success">
                                <h4>Content version changed successfully.</h4>
                            </RS.Alert>
                        }
                        {updateState == ContentVersionUpdatingStatus.FAILURE &&
                            <RS.Alert color="danger">
                                <h4>Error: Content version could not be changed.</h4>
                            </RS.Alert>
                        }
                    </React.Fragment>}

                    <h3>Manage users</h3>
                    <div>
                        <strong>Merge users</strong>
                    </div>
                    <FormGroup>
                        <RS.InputGroup>
                            <RS.Input
                                type="text"
                                placeholder="Target User ID"
                                value={mergeTargetId}
                                onChange={(e => setMergeTargetId(e.target.value))}
                            />
                            <RS.Input
                                type="text"
                                placeholder="Source User ID"
                                value={mergeSourceId}
                                onChange={(e => setMergeSourceId(e.target.value))}
                            />
                            <RS.InputGroupAddon addonType="append">
                                <RS.Button
                                    type="button" className="p-0 border-dark"
                                    disabled={mergeTargetId === "" || Number.isNaN(Number(mergeTargetId)) || mergeSourceId === "" || Number.isNaN(Number(mergeSourceId))}
                                    onClick={startMergeUsers}
                                >
                                    Merge
                                </RS.Button>
                            </RS.InputGroupAddon>
                        </RS.InputGroup>
                    </FormGroup>
                </RS.CardBody>
            </RS.Card>

        </div>
    </RS.Container>;
};
