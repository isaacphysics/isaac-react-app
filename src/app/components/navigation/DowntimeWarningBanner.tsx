import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';
import {SITE_TITLE} from "../../services";

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

    const inDateRange = new Date(1704672000000) <= new Date() && new Date() <= new Date(1705262400000);

    return inDateRange && noCookie ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="danger" className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center"}}>
                    <RS.Col xs={12} md={9}>
                        {SITE_TITLE} may be unavailable on Sunday 14 January due to data centre maintenance.
                    </RS.Col>
                    <RS.Col xs={12} md={3} className="text-center">
                        <RS.Button color="primary" outline className="my-2 my-md-0 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                            Dismiss<span className="sr-only"> downtime notification</span>
                        </RS.Button>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
