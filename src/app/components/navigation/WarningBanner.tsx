import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';
import {SITE, SITE_SUBJECT, SITE_SUBJECT_TITLE} from "../../services/siteConstants";

const WARNING_COOKIE = "warningBannerDismissed";

export const WarningBanner = () => {
    const [noCookie, setCookie] = useState(() => {
        const currentCookieValue = Cookies.get(WARNING_COOKIE);
        return currentCookieValue !== "1";
    });

    const twitterLink = {
        [SITE.CS]: "https://twitter.com/isaaccompsci",
        [SITE.PHY]: "https://twitter.com/isaacphysics"
    }[SITE_SUBJECT];

    function clickDismiss() {
        setCookie(false);
        Cookies.set(WARNING_COOKIE, "1", {expires: 30 /* days*/});
    }

    const inDateRange = new Date(1608076800000) <= new Date() && new Date() <= new Date(1609718400000);

    return inDateRange && noCookie ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="warning" className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center"}}>
                    <RS.Col xs={12} md={9}>
                        <span>Please note Isaac {SITE_SUBJECT_TITLE} will have minimal support over the festive break (19th Dec - 3rd Jan).
                            <a href={twitterLink} target="_blank" rel="noopener noreferrer">Check our Twitter feed for more information.</a>
                        </span>
                    </RS.Col>
                    <RS.Col xs={12} md={3} className="text-center">
                        <RS.Button color="primary" outline className="mt-3 mb-2 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                            Dismiss<span className="sr-only"> warning notification</span>
                        </RS.Button>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
