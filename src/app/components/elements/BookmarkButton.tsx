import React, { useState } from "react";
import { IconButton } from "./AffixButton";
import { useBookmarks } from "../../services/bookmarks";
import classNames from "classnames";
import { ContentDTO } from "../../../IsaacApiTypes";
import { Tooltip } from "reactstrap";
import { selectors, useAppSelector } from "../../state";
import { isLoggedIn } from "../../services";

export const BookmarkButton = ({ doc }: { doc?: ContentDTO }) => {
    const { isBookmarked, bookmarkItem } = useBookmarks();
    const [showBookmarkTooltip, setShowBookmarkTooltip] = useState(false);
    const user = useAppSelector(selectors.user.orNull);

    if (!doc?.id || !isLoggedIn(user)) return null;

    const isQuestionBookmarked = doc?.type === "isaacQuestionPage" && doc.id ? isBookmarked(doc.id) : false;

    return <>
        <IconButton 
            id="bookmark-button"
            icon={classNames("icon-bookmark", "icon-color-black-hoverable", {"fill": isQuestionBookmarked})} 
            color="tint"
            data-bs-theme="neutral"
            onClick={() => {
                if (!isQuestionBookmarked) {
                    setShowBookmarkTooltip(true);
                    setTimeout(() => setShowBookmarkTooltip(false), 1000);
                }

                bookmarkItem(doc?.id);
            }}
        />
        <Tooltip 
            id="bookmark-popover"
            target="bookmark-button"
            isOpen={showBookmarkTooltip}
            toggle={() => setShowBookmarkTooltip(!showBookmarkTooltip)}
            trigger="manual"
        >
            <div className="popover-header">Saved!</div>
        </Tooltip>
    </>;
};
