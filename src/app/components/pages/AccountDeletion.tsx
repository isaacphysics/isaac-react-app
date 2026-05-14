import React, { useState } from "react";
import { Button, Container, Form, FormGroup, FormProps, Input, Label } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isTutorOrAbove, useQueryParams } from "../../services";
import { selectors, useAppSelector, useDeleteAccountMutation } from "../../state";
import { Link } from "react-router-dom";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { PageFragment } from "../elements/PageFragment";
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()
    const DeletionFormCheckbox = ({reason, label, id}: {reason: DELETION_REASON, label: string, id: string}) => {
        return <FormGroup check className="d-flex align-items-center mb-2">
            <Input type="radio" name={reason} id={id} className="me-2" value={reason} checked={deletionReason === reason} onChange={(e) => setDeletionReason(e.target.value as DELETION_REASON)} />
            <Label check for={id} className="mb-0">{label}</Label>
        </FormGroup>;
    };

    return <Form {...props}>
        <DeletionFormCheckbox reason={DELETION_REASON.NO_LONGER_NEED} label={t('iNoLongerNeedMyAccount', 'I no longer need my account.')} id="noLongerNeed" />
        <DeletionFormCheckbox reason={DELETION_REASON.MAKE_NEW_ACCOUNT} label={t('iWantToCreateANewAccountWithThisEmailAddress', 'I want to create a new account with this email address.')} id="makeNewAccount" />
        <DeletionFormCheckbox reason={DELETION_REASON.ACCIDENTAL_CREATION} label={t('iMadeAnAccountByMistake', 'I made an account by mistake.')} id="accidentalCreation" />
        <DeletionFormCheckbox reason={DELETION_REASON.MULTIPLE_ACCOUNTS} label={t('iHaveMultipleAccountsAndOnlyRequireOne', 'I have multiple accounts and only require one.')} id="multipleAccounts" />
        <DeletionFormCheckbox reason={DELETION_REASON.UNKNOWN} label={t('anotherReasonPreferNotToSay', 'Another reason / prefer not to say.')} id="unknown" />
    </Form>;
};

export const AccountDeletion = () => {
    const { t } = useTranslation()
    const queryParams = useQueryParams();
    const token = queryParams.token as string | undefined;
    const user = useAppSelector(selectors.user.orNull);
    const [deletionReason, setDeletionReason] = useState<DELETION_REASON>(DELETION_REASON.UNKNOWN);
    const [confirmDeletion, setConfirmDeletion] = useState(false);
    const [deleteAccount, {isLoading: isDeletingAccount}] = useDeleteAccountMutation();

    return <Container className="pb-7">
        <TitleAndBreadcrumb 
            currentPageTitle={t('accountDeletion', 'Account deletion')} className="mb-4"
            icon={{"type": "icon", "icon": "icon-account"}}
        />
        {!user ? <p>{t('youMustBeLoggedInToDeleteYourAccount', 'You must be logged in to delete your account.')}</p> :
            isTutorOrAbove(user) ? <p>{t('onlyStudentAccountsCanBeDeletedAutomaticallyPlease', 'Only student accounts can be deleted automatically. Please')} <Link to="/contact?preset=accountDeletion">{t('contactUs', 'contact us')}</Link> {t('toRequestAccountDeletion', 'to request account deletion.')}</p> : 
                !token ? <p>{t('youMustHaveAValidTokenToDeleteYourAccountVisitYour', 'You must have a valid token to delete your account. Visit your')} <Link to="/account">{t('accountPage', 'account page')}</Link> {t('toGenerateANewEmailWithAToken', 'to generate a new email with a token.')}</p> : 
                    <>
                        <PageFragment fragmentId="account_deletion_final_warning" />
                        <p>{t('pleaseSelectTheReasonYouWishToDeleteYourAccount', 'Please select the reason you wish to delete your account:')}</p>
                        <DeletionReasonForm className="ms-2" deletionReason={deletionReason} setDeletionReason={setDeletionReason} />
                        <FormGroup check className="mt-4 ps-0">
                            <StyledCheckbox
                                id="confirmDeletion"
                                color="danger"
                                onChange={(e) => setConfirmDeletion(e.target.checked)}
                                label={<span>{t('iUnderstandThatDeletingMyAccountIsPermanentAndCannotBeUndone', 'I understand that deleting my account is permanent and cannot be undone.')}</span>}
                            />
                        </FormGroup>
                        <Button color="danger" className="mt-3" onClick={() => deleteAccount({token, deletionReason: deletionReason.valueOf()})} disabled={isDeletingAccount || !confirmDeletion}>{t('deleteAccount', 'Delete Account')}</Button>
                    </>
        }
    </Container>;
};
