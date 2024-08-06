import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';
import {SITE_TITLE, siteSpecific} from "../../services";

const DOWNTIME_COOKIE = "downtimeBannerDismissed";

export const DowntimeWarningBanner = () => {
    const [noCookie, setCookie] = useState(() => {
        const currentCookieValue = Cookies.get(DOWNTIME_COOKIE);
        return currentCookieValue != "1";
    });

    function clickDismiss() {
        setCookie(false);
        Cookies.set(DOWNTIME_COOKIE, "1", {expires: 14 /* days*/});
    }

    const inDateRange = new Date(1723114800000) <= new Date() && new Date() <= new Date(1723327200000);
    const colour = siteSpecific("danger", "warning"); // Ada doesn't support "danger" colours!

    return inDateRange && noCookie ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color={colour} className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center"}}>
                    <RS.Col xs={12} md={9}>
                        {SITE_TITLE} will be unavailable on Saturday 10 August from 8pm BST until early Sunday morning for essential server maintenance.
                    </RS.Col>
                    <RS.Col xs={12} md={3} className="text-center">
                        <RS.Button color="primary" outline className="my-2 my-md-0 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                            Dismiss<span className="visually-hidden"> downtime notification</span>
                        </RS.Button>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
