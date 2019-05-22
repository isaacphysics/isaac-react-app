import React, {useState} from 'react';
import {Link} from "react-router-dom";
import * as RS from 'reactstrap';
import Cookies from 'js-cookie';

const COOKIE_COOKIE = "isaacCookiesAccepted";

export const CookieBanner = () => {
    const [show, setShown] = useState(() => {
        const currentCookieValue = Cookies.get(COOKIE_COOKIE);
        return currentCookieValue != "1";
    });

    function clickDismiss() {
        setShown(false);
        Cookies.set(COOKIE_COOKIE, "1", {expires: 720 /* days*/})
    }

    return show ? <RS.Container className="cookie-banner">
        <RS.Row style={{alignItems: "center"}}>
            <RS.Col xs={12} sm={2} md={1}>
                <h3 className="text-center" role="presentation">ℹ️<span className="d-inline-block d-sm-none">&nbsp;Cookies</span></h3>
            </RS.Col>
            <RS.Col xs={12} sm={10} md={7}>
                <small>Use of this website and the information entered is being recorded. This data is used to support research
                into online learning at the University of Cambridge. Cookies are used to support this functionality.
                Full details are in the <Link to="/privacy">privacy policy</Link> and <Link to="/cookies">cookie policy</Link>.
                Do you agree to participate in this research?</small>
            </RS.Col>
            <RS.Col xs={12} md={4}>
                <RS.Button color="primary" className="d-block d-md-inline-block cookie-banner-button" onClick={clickDismiss}>I Agree</RS.Button>
            </RS.Col>
        </RS.Row>
    </RS.Container> : null;
};