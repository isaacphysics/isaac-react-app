import React, { useState } from "react";
import { Button, Container, Form, FormGroup, FormProps, Input, Label } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { useQueryParams } from "../../services";
import { selectors, useAppSelector, useDeleteAccountMutation } from "../../state";
import { Link } from "react-router-dom";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";

enum DELETION_REASON {
    NO_LONGER_NEED = "no_longer_need",
    MAKE_NEW_ACCOUNT = "make_new_account",
    ACCIDENTAL_CREATION = "accidental_creation",
    NOT_LISTED = "not_listed",
    OTHER = "other",
}

interface DeletionReasonFormProps extends FormProps {
    deletionReason: DELETION_REASON;
    setDeletionReason: (reason: DELETION_REASON) => void;
}

const DeletionReasonForm = ({deletionReason, setDeletionReason, ...props}: DeletionReasonFormProps) => {
    const DeletionFormCheckbox = ({reason, label, id}: {reason: DELETION_REASON, label: string, id: string}) => {
        return <FormGroup check className="d-flex align-items-center mb-2">
            <Input type="radio" name={reason} id={id} className="me-2" value={reason} checked={deletionReason === reason} onChange={(e) => setDeletionReason(e.target.value as DELETION_REASON)} />
            <Label check for={id} className="mb-0">{label}</Label>
        </FormGroup>;
    };

    return <Form {...props}>
        <DeletionFormCheckbox reason={DELETION_REASON.NO_LONGER_NEED} label="I no longer need my account." id="noLongerNeed" />
        <DeletionFormCheckbox reason={DELETION_REASON.MAKE_NEW_ACCOUNT} label="I want to create a new account." id="makeNewAccount" />
        <DeletionFormCheckbox reason={DELETION_REASON.ACCIDENTAL_CREATION} label="I didn&apos;t want to make an account." id="accidentalCreation" />
        <DeletionFormCheckbox reason={DELETION_REASON.NOT_LISTED} label="Another reason not listed here." id="notListed" />
        <DeletionFormCheckbox reason={DELETION_REASON.OTHER} label="Prefer not to say." id="other" />
    </Form>;
};

export const AccountDeletion = () => {
    const queryParams = useQueryParams();
    const token = queryParams.token as string | undefined;
    const user = useAppSelector(selectors.user.orNull);
    const [deletionReason, setDeletionReason] = useState<DELETION_REASON>(DELETION_REASON.OTHER);
    const [confirmDeletion, setConfirmDeletion] = useState(false);
    const [deleteAccount, {isLoading: isDeletingAccount}] = useDeleteAccountMutation();

    return <Container className="pb-5">
        <TitleAndBreadcrumb currentPageTitle={"Account Deletion"} />
        {!user && <p>You must be logged in to delete your account.</p>}
        {user && !token && <p>You must have a valid token to delete your account. Visit your <Link to="/account">account page</Link> to generate a new email with a token.</p>}
        {user && token && <>
            <p>Deleting your account is irreversible and will remove all of your identifiable information from our system. Your progress, connections and account information will be lost. Your prior anonymised usage of the site will still be retained for research purposes.</p>
            <p>Please select the reason for deleting your account:</p>
            <DeletionReasonForm className="ms-2" deletionReason={deletionReason} setDeletionReason={setDeletionReason} />
            <FormGroup check className="mt-4 ps-0">
                <StyledCheckbox
                    id="confirmDeletion"
                    color="danger"
                    onChange={(e) => setConfirmDeletion(e.target.checked)}
                    label={<span>I understand that deleting my account is permanent and cannot be undone.</span>}
                />
            </FormGroup>
            <Button color="danger" className="mt-3" onClick={() => deleteAccount({token, deletionReason: deletionReason.valueOf()})} disabled={isDeletingAccount || !confirmDeletion}>Delete Account</Button>
        </>}
    </Container>;
};
