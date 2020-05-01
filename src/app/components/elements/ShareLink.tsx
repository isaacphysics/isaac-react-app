import React, {useEffect, useRef, useState} from "react";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {useSelector} from "react-redux";
import {AppState} from "../../state/reducers";

export const ShareLink = (props: {linkUrl: string}) => {
    const {linkUrl} = props;
    const [showShareLink, setShowShareLink] = useState(false);
    const segueEnvironment = useSelector((state: AppState) =>
        (state && state.constants && state.constants.segueEnvironment) || "unknown"
    );
    const shareLink = useRef<HTMLInputElement>(null);
    const csUrlOrigin = segueEnvironment !== "DEV" ? "https://isaaccs.org" : window.location.origin;
    let shortenedLinkUrl = linkUrl;
    if (SITE_SUBJECT == SITE.CS && segueEnvironment !== "DEV") {
        shortenedLinkUrl = shortenedLinkUrl.replace('/questions/', '/q/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/concepts/', '/c/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/pages/', '/p/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/gameboards/', '/g/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/assignments/', '/a/');
    }

    const shareUrl = {[SITE.PHY]: window.location.origin, [SITE.CS]: csUrlOrigin}[SITE_SUBJECT] + shortenedLinkUrl;

    function toggleShareLink() {
        setShowShareLink(!showShareLink);
    }

    useEffect(() => {
        if (showShareLink && shareLink.current) {
            shareLink.current.focus();
            const selection = window.getSelection();
            if (selection) {
                const range = document.createRange();
                range.selectNode(shareLink.current);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }, [showShareLink]);

    let buttonAriaLabel = showShareLink ? "Hide share link" : "Get share link";

    return <React.Fragment>
        <button className="share-link-icon btn-action" onClick={() => toggleShareLink()} aria-label={buttonAriaLabel} />
        <div
            className={`share-link ${showShareLink ? "d-block" : ""}`}
            style={{width: Math.min((shareUrl.length + 1), 20) * 8.5}}
        >
            <input type="text" readOnly ref={shareLink} value={shareUrl} aria-label="Share URL" />
        </div>
    </React.Fragment>;
};
