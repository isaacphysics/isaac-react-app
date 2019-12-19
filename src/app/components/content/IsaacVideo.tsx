import React, {useCallback} from 'react';
import {VideoDTO} from "../../../IsaacApiTypes";
import {connect} from "react-redux";
import {logAction} from "../../state/actions";
import {AppState} from "../../state/reducers";

interface IsaacVideoProps {
    doc: VideoDTO;
    pageId?: string;
    logAction: (eventDetails: object) => void;
}

function mapStateToProps(state: AppState) {
    // TODO: This reference to 404 may want refactoring!
    if (state && state.doc && state.doc != 404) {
        return {pageId: state.doc.id};
    }
}

function rewrite(src: string) {
    return src
        .replace('watch?v=', 'embed/')
        .replace("youtube.com", "youtube-nocookie.com")
    + "?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=" + window.location.origin
}

function onPlayerStateChange(event: any, logAction: (eventDetails: object) => void, pageId?: string) {
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

    logAction(logEventDetails);
}

const IsaacVideoComponent = (props: IsaacVideoProps) => {
    const {doc: {src, altText}, pageId, logAction} = props;

    const videoRef = useCallback( node => {
        const $window: any = window;
        if (node !== null && $window.YT) {
            $window.YT.ready(function() {
                const stateChangeCallback = (event: any) => onPlayerStateChange(event, logAction, pageId);
                new $window.YT.Player(node, {events: {'onStateChange': stateChangeCallback}});
            });
        }
    }, [logAction, pageId]);

    return <div>
        <div className="no-print content-value text-center">
            { src ?
                <iframe ref={videoRef} className="mw-100" title={altText} width="614" height="390" src={rewrite(src)} frameBorder="0" allowFullScreen/>
                : altText
            }
        </div>
        <div className="only-print">
            Video source: {altText || "No text description available"}
        </div>
    </div>;
};

export const IsaacVideo = connect(mapStateToProps, {logAction: logAction})(IsaacVideoComponent);
