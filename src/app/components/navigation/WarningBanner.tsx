import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';

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

    const inDateRange = new Date("2023-03-20") <= new Date() && new Date() <= new Date("2023-03-28");

    return inDateRange ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="warning" className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center", textAlign: "center"}}>
                    <RS.Col xs={12} md={12}>
                        <span>
                            Isaac Computer Science will be temporarily unavailable as we make some exciting updates to the platform. <br />
                            The site is expected to be down from 4pm on 27 March 2023. Follow us on Twitter, Facebook or Instagram for updates. <br />
                            We can’t wait for you to see it!
                        </span>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
