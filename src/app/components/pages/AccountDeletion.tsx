import React, { useState } from "react";
import { Button, Container, Form, FormGroup, FormProps, Input, Label } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isTutorOrAbove, useQueryParams } from "../../services";
import { selectors, useAppSelector, useDeleteAccountMutation } from "../../state";
import { Link } from "react-router-dom";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { PageFragment } from "../elements/PageFragment";

enum DELETION_REASON {
    NO_LONGER_NEED = "no_longer_need",
    MAKE_NEW_ACCOUNT = "make_new_account",
    ACCIDENTAL_CREATION = "accidental_creation",
    MULTIPLE_ACCOUNTS = "multiple_accounts",
    UNKNOWN = "unknown",
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
        <DeletionFormCheckbox reason={DELETION_REASON.MAKE_NEW_ACCOUNT} label="I want to create a new account with this email address." id="makeNewAccount" />
        <DeletionFormCheckbox reason={DELETION_REASON.ACCIDENTAL_CREATION} label="I made an account by mistake." id="accidentalCreation" />
        <DeletionFormCheckbox reason={DELETION_REASON.MULTIPLE_ACCOUNTS} label="I have multiple accounts and only require one." id="multipleAccounts" />
        <DeletionFormCheckbox reason={DELETION_REASON.UNKNOWN} label="Another reason / prefer not to say." id="unknown" />
    </Form>;
};

export const AccountDeletion = () => {
    const queryParams = useQueryParams();
    const token = queryParams.token as string | undefined;
    const user = useAppSelector(selectors.user.orNull);
    const [deletionReason, setDeletionReason] = useState<DELETION_REASON>(DELETION_REASON.UNKNOWN);
    const [confirmDeletion, setConfirmDeletion] = useState(false);
    const [deleteAccount, {isLoading: isDeletingAccount}] = useDeleteAccountMutation();

    return <Container className="pb-7">
        <TitleAndBreadcrumb 
            currentPageTitle={"Account deletion"} className="mb-4"
            icon={{"type": "icon", "icon": "icon-account"}}
        />
        {!user ? <p>You must be logged in to delete your account.</p> :
            isTutorOrAbove(user) ? <p>Only student accounts can be deleted automatically. Please <Link to="/contact?preset=accountDeletion">contact us</Link> to request account deletion.</p> : 
                !token ? <p>You must have a valid token to delete your account. Visit your <Link to="/account">account page</Link> to generate a new email with a token.</p> : 
                    <>
                        <PageFragment fragmentId="account_deletion_final_warning" />
                        <p>Please select the reason you wish to delete your account:</p>
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
                    </>
        }
    </Container>;
};
