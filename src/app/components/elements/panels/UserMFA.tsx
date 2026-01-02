import {Button, CardBody, Col, Form, FormGroup, Input, Label, Row} from "reactstrap";
import React, {useMemo, useState} from "react";
import {RegisteredUserDTO, UserAuthenticationSettingsDTO} from "../../../../IsaacApiTypes";
import {AUTHENTICATOR_FRIENDLY_NAMES_MAP, isDefined, SITE_TITLE, siteSpecific} from "../../../services";
import {
    useGetSegueEnvironmentQuery,
    useDisableAccountMFAMutation,
    useNewMFASecretMutation,
    useSetupAccountMFAMutation
} from "../../../state";
import QRCode from 'qrcode';
import { MyAccountTab } from "./MyAccountTab";

interface UserMFAProps {
    userToUpdate: RegisteredUserDTO;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
    editingOtherUser: boolean;
}

const UserMFA = ({userToUpdate, userAuthSettings, editingOtherUser}: UserMFAProps) => {
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();
    const [successfulMFASetup, setSuccessfulMFASetup] = useState(false);
    const [mfaVerificationCode, setMFAVerificationCode] = useState<string | undefined>(undefined);
    const [qrCodeStringBase64SVG, setQrCodeStringBase64SVG] = useState<string | undefined>(undefined);

    const [ newMFASecret, { data: totpSharedSecret, reset: resetMFASecret } ] = useNewMFASecretMutation();
    const [ setupAccountMFA ] = useSetupAccountMFAMutation();
    const [ disableAccountMFA ] = useDisableAccountMFAMutation();

    const authenticatorURL: string | null = useMemo(() => {
        if (totpSharedSecret && totpSharedSecret.sharedSecret) {
            let issuer = encodeURIComponent(SITE_TITLE);
            if (segueEnvironment === "DEV") {
                issuer += encodeURIComponent(` (${window.location.host})`);
            }
            const authenticatorURL = `otpauth://totp/${userToUpdate.email}?secret=${totpSharedSecret.sharedSecret}&issuer=${issuer}`;
            QRCode.toString(authenticatorURL, {type:'svg'}, function (err, val) {
                if (err) {
                    console.error(err);
                    return;
                }
                setQrCodeStringBase64SVG(window.btoa(val));
            });
            return authenticatorURL;
        }
        return null;
    }, [totpSharedSecret]);

    if (!isDefined(totpSharedSecret) && mfaVerificationCode) {
        // assume we have just completed a successful configuration of MFA as secret is clear and tidy up
        setMFAVerificationCode(undefined);
        setSuccessfulMFASetup(true);
    }

    // NOTE FOR REVIEWER: Instead of having to make overlapping types like
    // this, can we not refactor the form? Ideally, only the onSubmit action
    // should be needed (unless React hijacks it, in which case two functions
    // might be nicer, calling a third, if only a bit convoluted)
    //
    // Just rambling.
    function setupMFA(event?: React.FormEvent<HTMLButtonElement | HTMLFormElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        if (totpSharedSecret && mfaVerificationCode) {
            setupAccountMFA({sharedSecret: totpSharedSecret.sharedSecret, mfaVerificationCode}).then(resetMFASecret);
        }
    }

    return <MyAccountTab
        className="pt-0"
        leftColumn={null}
        rightColumn={
            <CardBody className="pt-0 px-0">
                <Row>
                    {siteSpecific(<div className="section-divider-bold"/>, <hr className="my-3"/>)}
                    <h4>Two-factor Authentication (2FA)</h4>
                </Row>
                {!editingOtherUser && userAuthSettings && userAuthSettings.hasSegueAccount ?
                    <Col>
                        <Row>
                            <Col>
                                <p><strong>2FA Status: </strong>{userAuthSettings.mfaStatus || successfulMFASetup ? "Enabled" : "Disabled"}</p>
                            </Col>
                        </Row>
                        {isDefined(totpSharedSecret) && isDefined(totpSharedSecret.sharedSecret) ?
                            <Form onSubmit={setupMFA}>
                                <Row>
                                    <Col>
                                        <h5>Configure Two-factor Authentication (2FA)</h5>
                                        <p><strong>Step 1:</strong> Scan the QRcode below on your phone</p>
                                        <div className="qrcode-mfa vertical-center">
                                            {qrCodeStringBase64SVG && <img
                                                src={'data:image/svg+xml;base64,' + qrCodeStringBase64SVG}
                                                alt={"Follow this URL to setup 2FA: " + authenticatorURL}
                                            />}
                                        </div>

                                        <FormGroup className="form-group">
                                            <p><strong>Step 2:</strong> Enter the code provided by your app</p>
                                            <Label htmlFor="setup-verification-code">Verification Code</Label>
                                            <Input
                                                id="setup-verification-code" type="text" name="setup-verification-code"
                                                value={mfaVerificationCode || ""}
                                                onChange={e => setMFAVerificationCode(e.target.value.replace(/ /g, ""))}
                                            />
                                        </FormGroup>
                                        <FormGroup className="form-group">
                                            <Button
                                                type="submit"
                                                className="btn-keyline w-100"
                                                disabled={!mfaVerificationCode}
                                            >
                                                {userAuthSettings.mfaStatus ? "Change 2FA Device" : "Enable 2FA"}
                                            </Button>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Form>
                            :
                            <Row>
                                <Col>
                                    <FormGroup className="form-group">
                                        <Button
                                            type="button"
                                            className="btn-keyline w-100"
                                            onClick={() => newMFASecret()}
                                        >
                                            {userAuthSettings.mfaStatus ? "Change 2FA Device" : "Enable 2FA"}
                                        </Button>
                                    </FormGroup>
                                </Col>
                            </Row>
                        }
                    </Col>
                    : <Row className="pt-4">
                        {!editingOtherUser && userAuthSettings && userAuthSettings.linkedAccounts && <p>
                            You do not currently have a password set for this account; you
                            sign in using {" "}
                            {(userAuthSettings.linkedAccounts).map((linked, index) =>
                                <span key={index}>
                                    {AUTHENTICATOR_FRIENDLY_NAMES_MAP[linked]}
                                </span>
                            )}.
                        </p>}
                    </Row>
                }
                {editingOtherUser &&
                    <Row className="pt-4">
                        {userAuthSettings && <p>
                            <FormGroup className="form-group">
                                <Button
                                    className="btn-keyline"
                                    onClick={() => userToUpdate.id && disableAccountMFA(userToUpdate.id)}
                                >
                                    Disable 2FA for user
                                </Button>
                            </FormGroup>
                        </p>}
                    </Row>
                }
            </CardBody>}
    />;
};

export default UserMFA;
