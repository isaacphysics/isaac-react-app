import React, {useEffect, useRef, useState} from "react";
import {isMobile, isPhy, isTutorOrAbove, PATHS, siteSpecific, useOutsideCallback} from "../../services";
import {selectors, useAppSelector} from "../../state";
import classNames from "classnames";
import { IconButton, IconButtonProps } from "./AffixButton";

interface ShareLinkProps {
    linkUrl: string;
    reducedWidthLink?: boolean;
    gameboardId?: string;
    clickAwayClose?: boolean; 
    outline?: boolean;
    className?: string;
    innerClassName?: string;
    size?: "sm" | "md"; // "md" default (as used for PageMetadata buttons); "sm" aligns with regular .btn padding
    buttonProps?: Partial<IconButtonProps>;
}

export const ShareLink = ({linkUrl, reducedWidthLink, gameboardId, clickAwayClose, outline, className, innerClassName, size, buttonProps}: ShareLinkProps) => {
    const [showShareLink, setShowShareLink] = useState(false);
    const user = useAppSelector(selectors.user.orNull);
    const shareLink = useRef<HTMLInputElement>(null);
    const shortenedLinkUrl = linkUrl;
    // FIXME reintroduce share URL shortening?
    // const segueEnvironment = useAppSelector(selectors.segue.environmentOrUnknown);
    // if (isAda && segueEnvironment !== "DEV") {
    //     shortenedLinkUrl = shortenedLinkUrl.replace('/questions/', '/q/');
    //     shortenedLinkUrl = shortenedLinkUrl.replace('/concepts/', '/c/');
    //     shortenedLinkUrl = shortenedLinkUrl.replace('/pages/', '/p/');
    //     shortenedLinkUrl = shortenedLinkUrl.replace('/gameboards/', '/g/');
    //     shortenedLinkUrl = shortenedLinkUrl.replace('/assignments/', '/a/');
    // }

    const shareUrl = window.location.origin + shortenedLinkUrl;

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

    const shareLinkDivRef = useRef(null);
    useOutsideCallback(shareLinkDivRef, () => clickAwayClose && setShowShareLink(false), [setShowShareLink]);

    const buttonAriaLabel = showShareLink ? "Hide share link" : "Get share link";
    const linkWidth = isMobile() || reducedWidthLink ? siteSpecific(256, 192) : (shareUrl.length * siteSpecific(9, 6));
    const showDuplicateAndEdit = gameboardId && isTutorOrAbove(user);
    return <div ref={shareLinkDivRef} className={classNames(className, "position-relative", {"w-max-content d-inline-flex": isPhy})}>
        <div className={`action-buttons-popup-container ${showShareLink ? "" : "d-none"} ${showDuplicateAndEdit ? "double-height" : ""}`} style={{width: linkWidth}}>
            <input type="text" readOnly ref={shareLink} value={shareUrl} onClick={(e) => e.preventDefault()} aria-label="Share URL" />
        </div>
        {showShareLink && showDuplicateAndEdit && <div className="duplicate-and-edit" style={{width: linkWidth}}>
            <a href={`${PATHS.GAMEBOARD_BUILDER}?base=${gameboardId}`} className={isPhy ? "px-1" : ""}>
                Duplicate and edit
            </a>
        </div>}
        <IconButton
            icon={{name: "icon-share icon-color-black-hoverable", color: outline ? "" : "white"}}
            className={classNames(innerClassName, "w-max-content h-max-content action-button", {"icon-button-sm": size == "sm"})}
            aria-label={buttonAriaLabel}
            title="Share page"
            color="tint"
            data-bs-theme="neutral"
            onClick={(e) => { e.preventDefault(); toggleShareLink(); }}
            {...buttonProps}
        />
    </div>;
};
