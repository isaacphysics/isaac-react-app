import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';
import {SITE_TITLE} from "../../services";

const WARNING_COOKIE = "warningBannerDismissed";

export const WarningBanner = () => {
    const [noCookie, setCookie] = useState(() => {
        const currentCookieValue = Cookies.get(WARNING_COOKIE);
        return currentCookieValue !== "1";
    });

    function clickDismiss() {
        setCookie(false);
        Cookies.set(WARNING_COOKIE, "1", {expires: 30 /* days*/});
    }

    const inDateRange = new Date("2023-03-20") <= new Date() && new Date() <= new Date("2023-03-27");

    return inDateRange ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="warning" className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center", textAlign: "center"}}>
                    <RS.Col xs={12} md={12}>
                        <span>
                            {`${SITE_TITLE} may be unavailable on 13 January due to maintenance work. `}
                            <a href="/pages/2023-jan-datacentre-maintenance">
                                {"Find out more "}
                                <span className="sr-only">{"about the planned maintenance "}</span>
                                {"here"}
                            </a>.
                        </span>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
