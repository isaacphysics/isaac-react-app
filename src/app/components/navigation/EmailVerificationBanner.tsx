import React, {useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import * as RS from 'reactstrap';

import {EmailVerificationStatus} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {requestEmailVerification} from "../../state/actions";

function mapStateToProps(state: AppState) {
    return {user: state && state.user || null};
}

const mapDispatchToProps = {
    requestEmailVerification
};

interface EmailVerificationBannerProps {
    user: LoggedInUser | null;
    requestEmailVerification: () => void;
}
const EmailVerificationBannerComponent = ({user, requestEmailVerification}: EmailVerificationBannerProps) => {
    const status: EmailVerificationStatus | null = user && user.loggedIn && user.emailVerificationStatus || null;
    const [hidden, setHidden] = useState(false);

    function clickSnooze() {
        setHidden(true);
    }

    function clickVerify() {
        requestEmailVerification();
        setHidden(true);
    }

    const show = user != null && user.loggedIn && status != "VERIFIED" && !hidden;

    return show ? <div className="banner">
        <RS.Container className="py-3">

            <RS.Row style={{alignItems: "center"}}>
                <RS.Col xs={12} sm={2} md={1}>
                    <h3 className="text-center" role="presentation">
                        ℹ️
                        <span className="d-inline-block d-sm-none">&nbsp;Email Verification</span>
                    </h3>
                </RS.Col>
                {(status == null || status == "NOT_VERIFIED") && <React.Fragment>
                    <RS.Col xs={12} sm={10} md={8}>
                        <small>Your email address is not verified -
                            please find our email in your inbox and follow the verification link. You can <Link onClick={clickVerify}>request a new
                                verification email</Link> if necessary. To change
                            your account email, go to <Link to="/account">Account Settings</Link>.
                        </small>
                    </RS.Col>
                    <RS.Col xs={12} md={3} className="text-center">
                        <RS.Button color="primary" outline className="mt-3 mb-2 d-block d-md-inline-block banner-button" onClick={clickSnooze}>Snooze</RS.Button>
                    </RS.Col>
                </React.Fragment>}
                {(status == "DELIVERY_FAILED") &&
                    <RS.Col xs={12} sm={10} md={11}>
                        <small>One or more email(s) sent to your email
                            address failed. This means you won&apos;t receive emails from Isaac, and may prevent you
                            regaining access to your account. <br/>To start receiving emails again, change your email
                            address in your <Link to="/account">Account Settings</Link>. If you believe this is in
                            error, please <a href="mailto:webmaster@isaaccomputerscience.org">email us</a>.
                        </small>
                    </RS.Col>
                }
            </RS.Row>
        </RS.Container>
    </div> : null;
};

export const EmailVerificationBanner = connect(mapStateToProps, mapDispatchToProps)(EmailVerificationBannerComponent);
