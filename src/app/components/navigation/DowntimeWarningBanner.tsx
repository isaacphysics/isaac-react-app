import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';
import {SITE, SITE_SUBJECT, SITE_SUBJECT_TITLE} from "../../services/siteConstants";

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

export const DowntimeWarningBanner = () => {
    const [noCookie, setCookie] = useState(() => {
        const currentCookieValue = Cookies.get(DOWNTIME_COOKIE);
        return currentCookieValue != "1";
    });

    const twitterLink = {
        [SITE.CS]: "https://twitter.com/isaaccompsci",
        [SITE.PHY]: "https://twitter.com/isaacphysics"
    }[SITE_SUBJECT];

    function clickDismiss() {
        setCookie(false);
        Cookies.set(DOWNTIME_COOKIE, "1", {expires: 30 /* days*/});
    }

    const inDateRange = new Date(1617177600000) <= new Date() && new Date() <= new Date(1617436800000);

    return inDateRange && noCookie ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="danger" className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center"}}>
                    <RS.Col xs={12} md={9}>
                        <span>Please note Isaac {SITE_SUBJECT_TITLE} will be unavailable for several hours on 3<sup>rd</sup> April for planned maintenance.
                            <a href={twitterLink} target="_blank" rel="noopener noreferrer">Check our Twitter feed</a> for updates on the day.
                        </span>
                    </RS.Col>
                    <RS.Col xs={12} md={3} className="text-center">
                        <RS.Button color="primary" outline className="mt-3 mb-2 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                            Dismiss<span className="sr-only"> downtime notification</span>
                        </RS.Button>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
