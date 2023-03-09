import React, {useEffect, useRef, useState} from "react";
import {isAda, isMobile, isPhy, isTutorOrAbove, PATHS, siteSpecific, useOutsideCallback} from "../../services";
import {selectors, useAppSelector} from "../../state";
import classNames from "classnames";

export const ShareLink = ({linkUrl, reducedWidthLink, gameboardId, clickAwayClose, outline, className}: {linkUrl: string; reducedWidthLink?: boolean; gameboardId?: string; clickAwayClose?: boolean; outline?: boolean; className?: string}) => {
    const [showShareLink, setShowShareLink] = useState(false);
    const segueEnvironment = useAppSelector(selectors.segue.environmentOrUnknown);
    const user = useAppSelector(selectors.user.orNull);
    const shareLink = useRef<HTMLInputElement>(null);
    const csUrlOrigin = segueEnvironment !== "DEV" ? "https://isaaccs.org" : window.location.origin;
    let shortenedLinkUrl = linkUrl;
    if (isAda && segueEnvironment !== "DEV") {
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
    const linkWidth = isMobile() || reducedWidthLink ? 192 : (shareUrl.length * siteSpecific(9, 6));
    const showDuplicateAndEdit = gameboardId && isTutorOrAbove(user);
    return <div ref={shareLinkDivRef} className={classNames("share-link-icon", className)}>
        <button className={siteSpecific("btn-action", classNames({"outline": outline}))} onClick={() => toggleShareLink()} aria-label={buttonAriaLabel} />
        <div className={`share-link ${showShareLink ? "d-block" : ""} ${showDuplicateAndEdit ? "double-height" : ""}`} style={{width: linkWidth}}>
            <input type="text" readOnly ref={shareLink} value={shareUrl} aria-label="Share URL" />
            {showDuplicateAndEdit && <React.Fragment>
                {isPhy && <hr className="text-center mt-4" />}
                <a href={`${PATHS.GAMEBOARD_BUILDER}?base=${gameboardId}`} className={isPhy ? "px-1" : ""}>
                    {siteSpecific("Duplicate and Edit", "Duplicate and edit")}
                </a>
            </React.Fragment>}
        </div>
    </div>;
};
