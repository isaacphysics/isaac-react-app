import React, {useEffect, useRef, useState} from "react";
import {isCS, siteSpecific} from "../../services/siteConstants";
import {selectors, useAppSelector} from "../../state";
import {isMobile} from "../../services/device";
import {isTeacher} from "../../services/user";
import {useOutsideCallback} from "../../services/miscUtils";

export const ShareLink = ({linkUrl, reducedWidthLink, gameboardId, clickAwayClose}: {linkUrl: string; reducedWidthLink?: boolean; gameboardId?: string; clickAwayClose?: boolean}) => {
    const [showShareLink, setShowShareLink] = useState(false);
    const segueEnvironment = useAppSelector(selectors.segue.environmentOrUnknown);
    const user = useAppSelector(selectors.user.orNull);
    const shareLink = useRef<HTMLInputElement>(null);
    const csUrlOrigin = segueEnvironment !== "DEV" ? "https://isaaccs.org" : window.location.origin;
    let shortenedLinkUrl = linkUrl;
    if (isCS && segueEnvironment !== "DEV") {
        shortenedLinkUrl = shortenedLinkUrl.replace('/questions/', '/q/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/concepts/', '/c/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/pages/', '/p/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/gameboards/', '/g/');
        shortenedLinkUrl = shortenedLinkUrl.replace('/assignments/', '/a/');
    }

    const shareUrl = siteSpecific(window.location.origin, csUrlOrigin) + shortenedLinkUrl;

    function toggleShareLink() {
        setShowShareLink(!showShareLink);
    }

    useEffect(() => {
        if (showShareLink && shareLink.current) {
            shareLink.current.focus();
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                shareLink.current.setSelectionRange(0, -1);
            }
        }
    }, [showShareLink]);

    const shareLinkDivRef = useRef(null)
    useOutsideCallback(shareLinkDivRef, () => clickAwayClose && setShowShareLink(false), [setShowShareLink])

    const buttonAriaLabel = showShareLink ? "Hide share link" : "Get share link";
    const linkWidth = isMobile() || reducedWidthLink ? 192 : (shareUrl.length * 9);
    const showDuplicateAndEdit = gameboardId && isTeacher(user);
    return <div ref={shareLinkDivRef} className="share-link-icon">
        <button className="btn-action" onClick={() => toggleShareLink()} aria-label={buttonAriaLabel} />
        <div className={`share-link ${showShareLink ? "d-block" : ""} ${showDuplicateAndEdit ? "double-height" : ""}`} style={{width: linkWidth}}>
            <input type="text" readOnly ref={shareLink} value={shareUrl} aria-label="Share URL" />
            {showDuplicateAndEdit && <React.Fragment>
                <hr className="text-center mt-4" />
                <a href={`/gameboard_builder?base=${gameboardId}`} className="px-1">
                    {siteSpecific("Duplicate and Edit", "Duplicate and edit")}
                </a>
            </React.Fragment>}
        </div>
    </div>;
};
