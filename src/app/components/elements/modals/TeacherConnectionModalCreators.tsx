import React from "react";
import {
    authenticateWithToken,
    releaseAllAuthorisations,
    releaseAuthorisation,
    revokeAuthorisation
} from "../../../state";
import {extractTeacherName} from "../../../services";
import {buildActiveModal} from "./ActiveModal";
import {Button, Table} from "reactstrap";

export const TokenVerificationModal = buildActiveModal(
    "token-verification-modal",
    "TokenVerificationModal",
    ({usersToGrantAccess, closeModal, authToken, userId, dispatch}) => ({
        title: "Sharing your data",
        body: <>
            <p>Are you sure you would like to give the following Isaac users access to your data?</p>
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
                    <strong>Remember</strong>: you can always revoke access to your data from the Teacher Connections tab on this page.
                </small>
                <br />
                <small>
                    For more details about what information is shared, see our {" "}
                    <a href="/privacy" target="_blank">Privacy Policy</a>.
                </small>
            </p>
        </>,
        buttons: [
            <Button key={1} color="primary" outline onClick={closeModal}>
                Cancel
            </Button>,
            <Button key={0} color="secondary" onClick={() => {dispatch(authenticateWithToken(authToken))}}>
                Confirm
            </Button>,
        ]
    })
);

export const RevocationConfirmationModal = buildActiveModal(
    "revocation-confirmation-modal",
    "RevocationConfirmationModal",
    ({userId, userToRevoke, closeModal, dispatch}) => ({
        title: "Revoke access to your data",
        body: <p>
            The user <strong>{extractTeacherName(userToRevoke)}</strong>
            {" "}
            will no longer be able to access your data.
            <br />
            Are you sure you want to revoke access for this user?
        </p>,
        buttons: [
            <Button key={1} color="primary" outline onClick={closeModal}>
                Cancel
            </Button>,
            <Button key={0} color="secondary" onClick={() => {dispatch(revokeAuthorisation(userId, userToRevoke))}}>
                Confirm
            </Button>,
        ]
    })
);

export const ReleaseConfirmationModal = buildActiveModal(
    "release-confirmation-modal",
    "ReleaseConfirmationModal",
    ({userId, dispatch, closeModal, otherUser}) => ({
        title: "Remove access to students' data",
        body: <>
            <p>
                Are you sure you want to end your access to <strong>{otherUser.givenName} {otherUser.familyName}</strong>
                &apos;s data?
                <br />
                You will need to ask them to grant access again in the future if you change your mind.
            </p>
        </>,
        buttons: [
            <Button key={1} color="primary" outline onClick={closeModal}>
                Cancel
            </Button>,
            <Button key={0} color="secondary" onClick={() => {dispatch(releaseAuthorisation(userId, otherUser))}}>
                Confirm
            </Button>,
        ]
    })
);

export const ReleaseAllConfirmationModal = buildActiveModal(
    "release-all-confirmation-modal",
    "ReleaseAllConfirmationModal",
    ({userId, closeModal, dispatch}) => ({
        title: "Remove access to all students' data",
        body: <p>
            Are you sure you want to end your access to all students&apos; data?
            <br />
            You will need to ask them to grant access again in the future if you change your mind.
        </p>,
        buttons: [
            <Button key={1} color="primary" outline onClick={closeModal}>
                Cancel
            </Button>,
            <Button key={0} color="secondary" onClick={() => {dispatch(releaseAllAuthorisations(userId))}}>
                Confirm
            </Button>,
        ]
    })
);
