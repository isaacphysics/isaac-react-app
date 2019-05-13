import React from 'react';
import {VideoDTO} from "../../../IsaacApiTypes";

interface IsaacVideoProps {
    doc: VideoDTO;
}

function rewrite(src: string) {
    return src
        .replace('watch?v=', 'embed/')
        .replace("youtube.com", "youtube-nocookie.com")
    + "?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=" + window.location.origin
}

export const IsaacVideo = (props: IsaacVideoProps) => {
    const {doc: {src, altText}} = props;

    return <div className="content-value">
        { src ?
            <iframe title={altText} width="614" height="390" src={rewrite(src)} frameBorder="0" allowFullScreen/>
            : altText
        }
    </div>;
};