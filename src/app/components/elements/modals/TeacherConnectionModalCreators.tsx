import React from "react";
import {UserSummaryDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {
    authorisationsApi,
    closeActiveModal,
    store
} from "../../../state";
import {extractTeacherName, SITE_TITLE_SHORT} from "../../../services";
import { Table, Button } from "reactstrap";
import { Trans } from "react-i18next";
import i18next from "i18next";

export const tokenVerificationModal = (userId: number, authToken: string, usersToGrantAccess: UserSummaryWithEmailAddressDTO[]) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: i18next.t("common:account.sharingData.title"),
        body: <React.Fragment>
            <p>{i18next.t("common:account.sharingData.confirmBody", { siteName: SITE_TITLE_SHORT })}</p>
            <Table bordered>
                <tbody>
                    {usersToGrantAccess.map((member) => (<tr key={member.id}>
                        <td>
                            <span className="group-table-person" />
                            {extractTeacherName(member)} - ({member.email})
                        </td>
                    </tr>))}
                </tbody>
            </Table>

            {/* TODO Highlight already authorised teachers */}
            {/*{anyUsersAlreadyAuthorised && <p>*/}
            {/*    <small>*/}
            {/*        Teachers you are already sharing some data with are highlighted in green. If you have been asked to re-enter this group code;*/}
            {/*        the teachers not highlighted have been added since you joined the group. If this is a group code you&apos;ve not used before,*/}
            {/*        you need to confirm joining this group with all of these teachers.*/}
            {/*    </small>*/}
            {/*</p>}*/}

            <p>
                <small>
                    <Trans i18nKey="common:account.sharingData.rememberNote" components={{ strong: <strong /> }} />
                </small>
                <br />
                <small>
                    {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:account.sharingData.privacyNote" components={{ privacyPolicyLink: <a href="/privacy" target="_blank" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
                </small>
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color="keyline" onClick={() => {store.dispatch(closeActiveModal());}}>
                {i18next.t("common:account.sharingData.cancelButton")}
            </Button>,
            <Button key={0} color="solid" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.authenticateWithToken.initiate(authToken))
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                {i18next.t("common:account.sharingData.confirmButton")}
            </Button>,
        ]
    };
};

export const revocationConfirmationModal = (userId: number, userToRevoke: UserSummaryWithEmailAddressDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: i18next.t("common:account.revokeAccess.title"),
        body: <React.Fragment>
            <p>
                <Trans i18nKey="common:account.revokeAccess.confirmBody" components={{ strong: <strong />, br: <br /> }} values={{ teacherName: extractTeacherName(userToRevoke) }} />
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color="keyline" onClick={() => {store.dispatch(closeActiveModal());}}>
                {i18next.t("common:account.revokeAccess.cancelButton")}
            </Button>,
            <Button key={0} color="solid" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.revokeAuthorisation.initiate(userToRevoke.id as number))
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                {i18next.t("common:account.revokeAccess.confirmButton")}
            </Button>,
        ]
    };
};

export const releaseConfirmationModal = (userId: number, otherUser: UserSummaryDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: i18next.t("common:account.releaseAccess.title"),
        body: <React.Fragment>
            <p>
                <Trans i18nKey="common:account.releaseAccess.confirmBody" components={{ strong: <strong />, br: <br /> }} values={{ firstName: otherUser.givenName, lastName: otherUser.familyName }} />
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color="keyline" onClick={() => {store.dispatch(closeActiveModal());}}>
                {i18next.t("common:account.releaseAccess.cancelButton")}
            </Button>,
            <Button key={0} color="solid" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.releaseAuthorisation.initiate(otherUser.id as number))
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                {i18next.t("common:account.releaseAccess.confirmButton")}
            </Button>,
        ]
    };
};

export const releaseAllConfirmationModal = () => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: i18next.t("common:account.releaseAll.title"),
        body: <React.Fragment>
            <p>
                <Trans i18nKey="common:account.releaseAll.confirmBody" components={{ br: <br /> }} />
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color="keyline" onClick={() => {store.dispatch(closeActiveModal());}}>
                {i18next.t("common:account.releaseAll.cancelButton")}
            </Button>,
            <Button key={0} color="solid" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.releaseAllAuthorisations.initiate())
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                {i18next.t("common:account.releaseAll.confirmButton")}
            </Button>,
        ]
    };
};

export const confirmSelfRemovalModal = (userId: number, groupId: number) => {
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: i18next.t("common:account.leaveGroup.title"),
        body: <>
            <p>
                This group has enabled student self-removal. This means you can remove yourself from the group at any time, without requiring permission from 
                the owner(s) of the group. If you remove yourself, you will no longer receive assignments.
                <br/><br/>
                Note that if you have granted the group owner(s) access to your data, they can still view this data after you have left the group. To revoke 
                this access, use the Teacher Connections panel at the top of this page.
                <br/><br/>
                You can rejoin at any time using the code or link you used to join the group. Your progress, assignments and test scores will be retained.
            </p>
        </>,
        buttons: [
            <Button key={1} color="keyline" onClick={() => store.dispatch(closeActiveModal())}>
                {i18next.t("common:account.leaveGroup.cancelButton")}
            </Button>,
            <Button key={0} color="solid" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.deleteGroupMember.initiate({groupId, userId})).then(() => {
                    store.dispatch(closeActiveModal());
                });
            }}>
                {i18next.t("common:account.leaveGroup.confirmButton")}
            </Button>,
        ]
    };
};
