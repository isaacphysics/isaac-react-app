import React, { useState } from "react";
import { Button, Container, Form, FormGroup, FormProps, Input, Label } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isTutorOrAbove, useQueryParams } from "../../services";
import { selectors, useAppSelector, useDeleteAccountMutation } from "../../state";
import { Link } from "react-router-dom";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { PageFragment } from "../elements/PageFragment";
import { Trans, useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const DeletionFormCheckbox = ({reason, label, id}: {reason: DELETION_REASON, label: string, id: string}) => {
        return <FormGroup check className="d-flex align-items-center mb-2">
            <Input type="radio" name={reason} id={id} className="me-2" value={reason} checked={deletionReason === reason} onChange={(e) => setDeletionReason(e.target.value as DELETION_REASON)} />
            <Label check for={id} className="mb-0">{label}</Label>
        </FormGroup>;
    };

    return <Form {...props}>
        <DeletionFormCheckbox reason={DELETION_REASON.NO_LONGER_NEED} label={t("common:account.deletion.reasonNoLongerNeed")} id="noLongerNeed" />
        <DeletionFormCheckbox reason={DELETION_REASON.MAKE_NEW_ACCOUNT} label={t("common:account.deletion.reasonNewAccount")} id="makeNewAccount" />
        <DeletionFormCheckbox reason={DELETION_REASON.ACCIDENTAL_CREATION} label={t("common:account.deletion.reasonAccidental")} id="accidentalCreation" />
        <DeletionFormCheckbox reason={DELETION_REASON.MULTIPLE_ACCOUNTS} label={t("common:account.deletion.reasonMultiple")} id="multipleAccounts" />
        <DeletionFormCheckbox reason={DELETION_REASON.UNKNOWN} label={t("common:account.deletion.reasonOther")} id="unknown" />
    </Form>;
};

export const AccountDeletion = () => {
    const { t } = useTranslation();
    const queryParams = useQueryParams();
    const token = queryParams.token as string | undefined;
    const user = useAppSelector(selectors.user.orNull);
    const [deletionReason, setDeletionReason] = useState<DELETION_REASON>(DELETION_REASON.UNKNOWN);
    const [confirmDeletion, setConfirmDeletion] = useState(false);
    const [deleteAccount, {isLoading: isDeletingAccount}] = useDeleteAccountMutation();

    return <Container className="pb-7">
        <TitleAndBreadcrumb 
            currentPageTitle={t("common:account.deletion.title")} className="mb-4"
            icon={{"type": "icon", "icon": "icon-account"}}
        />
        {!user ? <p>{t("common:account.deletion.notLoggedIn")}</p> :
            isTutorOrAbove(user) ? <p><Trans i18nKey="common:account.deletion.tutorRestriction" components={{ contactLink: <Link to="/contact?preset=accountDeletion" /> }} /></p> : 
                !token ? <p><Trans i18nKey="common:account.deletion.noToken" components={{ accountLink: <Link to="/account" /> }} /></p> : 
                    <>
                        <PageFragment fragmentId="account_deletion_final_warning" />
                        <p>{t("common:account.deletion.selectReason")}</p>
                        <DeletionReasonForm className="ms-2" deletionReason={deletionReason} setDeletionReason={setDeletionReason} />
                        <FormGroup check className="mt-4 ps-0">
                            <StyledCheckbox
                                id="confirmDeletion"
                                color="danger"
                                onChange={(e) => setConfirmDeletion(e.target.checked)}
                                label={<span>{t("common:account.deletion.confirmWarning")}</span>}
                            />
                        </FormGroup>
                        <Button color="danger" className="mt-3" onClick={() => deleteAccount({token, deletionReason: deletionReason.valueOf()})} disabled={isDeletingAccount || !confirmDeletion}>{t("common:account.deletion.deleteButton")}</Button>
                    </>
        }
    </Container>;
};
