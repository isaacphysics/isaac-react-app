import React, {useRef, useState} from "react";

export const ShareLink = (props: {linkUrl: string}) => {
    const {linkUrl} = props;
    const [showShareLink, setShowShareLink] = useState(false);
    const shareLink = useRef<HTMLInputElement>(null);

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
        <button className="ru_share" onClick={() => toggleShareLink()}/>
        <div className={`share-link ${showShareLink ? "d-block" : ""}`}><div ref={shareLink}>{linkUrl}</div></div>
    </React.Fragment>
};
