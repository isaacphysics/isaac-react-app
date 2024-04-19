import React, {useState} from 'react';
import {Link} from "react-router-dom";
import * as RS from 'reactstrap';
import Cookies from 'js-cookie';
import {logAction, useAppDispatch} from "../../state";
import {isPhy, siteSpecific} from "../../services";

const COOKIE_COOKIE = "isaacCookiesAccepted";

export const CookieBanner = () => {
    const dispatch = useAppDispatch();
    const [show, setShown] = useState(() => {
        const currentCookieValue = Cookies.get(COOKIE_COOKIE);
        return currentCookieValue != "1";
    });

    function clickDismiss() {
        setShown(false);
        Cookies.set(COOKIE_COOKIE, "1", {expires: 720 /* days*/});
        const eventDetails = {type: "ACCEPT_COOKIES"};
        dispatch(logAction(eventDetails));
    }

    return show ? <div className="banner d-print-none" id="cookie-banner">
        <RS.Container className="py-3">
            <RS.Row style={{alignItems: "center"}}>
                <RS.Col xs={12} sm={2} md={1}>
                    <h3 className="text-center">
                        <span role="presentation" aria-labelledby="cookies-heading">
                            <img className={siteSpecific("mt-n2 mt-sm-0 mt-md-n1", "mt-n1 mt-sm-1")} src="/assets/common/info.svg" style={{height: "1.5rem"}} alt="" />
                        </span>
                        <span id="cookies-heading" className="d-inline-block d-sm-none">&nbsp;Cookies</span>
                    </h3>
                </RS.Col>
                <RS.Col xs={12} sm={10} md={8}>
                    <small>Use of this website and the information entered is being recorded. This data is used to support research
                    into online learning at the University of Cambridge. Cookies are used to support this functionality.
                    Full details are in the <Link to="/privacy">privacy policy</Link> and <Link to="/cookies">cookie policy</Link>.
                    Do you agree to participate in this research?</small>
                </RS.Col>
                <RS.Col xs={12} md={3} className="text-center">
                    <RS.Button color="primary" outline={isPhy} className="mt-3 mb-2 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                        I Agree
                    </RS.Button>
                </RS.Col>
            </RS.Row>
        </RS.Container>
    </div>: null;
};
