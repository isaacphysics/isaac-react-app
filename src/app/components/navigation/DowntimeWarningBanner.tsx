import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';
import {Link} from "react-router-dom";
import {SITE, SITE_SUBJECT, SITE_SUBJECT_TITLE} from "../../services/siteConstants";

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

export const DowntimeWarningBanner = () => {
    const [show, setShow] = useState(() => {
        const currentCookieValue = Cookies.get(DOWNTIME_COOKIE);
        return currentCookieValue != "1";
    });

    const twitterLink = (SITE_SUBJECT === SITE.CS) ?
        "https://twitter.com/isaaccompsci" :
        "https://twitter.com/isaacphysics";

    function clickDismiss() {
        setShow(false);
        Cookies.set(DOWNTIME_COOKIE, "1", {expires: 30 /* days*/});
    }

    return show ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="danger" className="mb-0">
            <RS.Container className="py-3">
                <RS.Row style={{alignItems: "center"}}>
                    <RS.Col xs={12} sm={10} md={8}>
                        <p>Please note that Isaac {SITE_SUBJECT_TITLE} will be unavailable during the morning of 1<sup>st</sup> August due to planned maintenance. Check our <a href={twitterLink} target="_blank" rel="noopener noreferrer">Twitter feed</a> for more information.</p>
                    </RS.Col>
                    <RS.Col xs={12} md={3} className="text-center">
                        <RS.Button color="primary" outline className="mt-3 mb-2 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                            Dismiss
                        </RS.Button>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
