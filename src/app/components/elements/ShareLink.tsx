import React, {useRef, useState} from "react";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import classnames from "classnames";

export const ShareLink = (props: {linkUrl: string}) => {
    const {linkUrl} = props;
    const [showShareLink, setShowShareLink] = useState(false);
    const segueEnvironment = useSelector((state: AppState) =>
        (state && state.constants && state.constants.segueEnvironment) || "unknown"
    );
    const shareLink = useRef<HTMLInputElement>(null);
    const csUrlOrigin = segueEnvironment !== "DEV" ? "https://isaaccs.org" : window.location.origin;
    let shortenedLinkUrl = linkUrl;
    if (SITE_SUBJECT == SITE.CS && (segueEnvironment !== "DEV")) {
        shortenedLinkUrl = shortenedLinkUrl.replace('/questions/', '/q/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/concepts/', '/c/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/pages/', '/p/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/gameboards/', '/g/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/assignments/', '/a/');
    }

    const shareUrl = {[SITE.PHY]: window.location.origin, [SITE.CS]: csUrlOrigin}[SITE_SUBJECT] + shortenedLinkUrl;

    function toggleShareLink() {
        if (showShareLink) {
            setShowShareLink(false);
        } else {
            setShowShareLink(true);
            setImmediate(() => {
                if (shareLink.current) {
                    if (window.getSelection && shareLink.current) {
                        let selection = window.getSelection();
                        if (selection) {
                            let range = document.createRange();
                            range.selectNodeContents(shareLink.current);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    }
                }
            });
        }
    }

    return <React.Fragment>
        <button className="share-link-icon btn-action" onClick={() => toggleShareLink()} aria-label="Get share link"/>
        <div className={classnames({"share-link": true, "d-block": showShareLink})}><div ref={shareLink}>{shareUrl}</div></div>
    </React.Fragment>
};
