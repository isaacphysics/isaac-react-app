import React, {useCallback} from 'react';
import {VideoDTO} from "../../../IsaacApiTypes";
import {useDispatch, useSelector} from "react-redux";
import {logAction} from "../../state/actions";
import {selectors} from "../../state/selectors";
import {NOT_FOUND} from "../../services/constants";

interface IsaacVideoProps {
    doc: VideoDTO;
}

function rewrite(src: string) {
    return src
        .replace('youtu.be/', 'www.youtube.com/watch?v=')
        .replace('watch?v=', 'embed/')
        .replace("youtube.com", "youtube-nocookie.com")
    + "?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=" + window.location.origin
}

function onPlayerStateChange(event: any, wrappedLogAction: (eventDetails: object) => void, pageId?: string) {
    const YT = (window as any).YT;
    let logEventDetails: any = {
        videoUrl: event.target.getVideoUrl(),
        videoPosition: event.target.getCurrentTime(),
    };

    if (pageId) {
        logEventDetails.pageId = pageId;
    }

    switch(event.data) {
        case YT.PlayerState.PLAYING:
            logEventDetails.type = "VIDEO_PLAY";
            break;
        case YT.PlayerState.PAUSED:
            logEventDetails.type = "VIDEO_PAUSE";
            break;
        case YT.PlayerState.ENDED:
            logEventDetails.type = "VIDEO_ENDED";
            delete logEventDetails.videoPosition;
            break;
        default:
            return; // Don't send a log message.
    }

    wrappedLogAction(logEventDetails);
}

export function pauseVideo() {
    let iframes = document.getElementsByTagName("iframe");
    for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow) {
            iframes[i].contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
    }
}


export function IsaacVideo(props: IsaacVideoProps) {
    const dispatch = useDispatch();
    const {doc: {src, altText}} = props;
    const page = useSelector(selectors.doc.get);
    const pageId = page && page !== NOT_FOUND && page.id || undefined;

    const videoRef = useCallback( node => {
        const $window: any = window;
        if (node !== null && $window.YT) {
            $window.YT.ready(function() {
                const stateChangeCallback = (event: any) =>
                    onPlayerStateChange(event, eventDetails => dispatch(logAction(eventDetails)), pageId);
                new $window.YT.Player(node, {events: {'onStateChange': stateChangeCallback}});
            });
        }
    }, [dispatch, pageId]);

    return <div>
        <div className="no-print content-value text-center">
            { src ?
                <iframe ref={videoRef} className="mw-100" title={altText} width="614" height="390" src={rewrite(src)} frameBorder="0" allowFullScreen/>
                : altText
            }
        </div>
        <div className="only-print">
            Video description: {altText || "No text description available"}
        </div>
    </div>;
}
