import React, {useCallback, useContext} from 'react';
import {VideoDTO} from "../../../IsaacApiTypes";
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {NOT_FOUND, trackEvent, useUserConsent} from "../../services";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import { YoutubeCookieHandler } from '../handlers/InterstitialCookieHandler';
import classNames from "classnames";

interface IsaacVideoProps {
    doc: VideoDTO;
}

function rewrite(src: string) {
    const possibleVideoId = /(v=|\/embed\/|\/)([^?&/.]{11})/.exec(src);
    const possibleStartTime = /[?&](t|start)=([0-9]+)/.exec(src);
    const possibleEndTime = /[?&]end=([0-9]+)/.exec(src);
    if (possibleVideoId) {
        const videoId = possibleVideoId[2];
        const optionalStart = possibleStartTime ? `&start=${possibleStartTime[2]}` : "";
        const optionalEnd = possibleEndTime ? `&end=${possibleEndTime[1]}` : "";
        return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0&fs=1&modestbranding=1` +
               `${optionalStart}${optionalEnd}&origin=${window.location.origin}`;
    }
}

function onPlayerStateChange(event: any, wrappedLogAction: (eventDetails: object) => void, pageId?: string) {
    const YT = (window as any).YT;
    const logEventDetails: any = {
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

export function pauseAllVideos() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command',
            func: 'pauseVideo' }), '*');
    });
}

function trackYoutubeError(videoSrc: string, errorMessage: string) {
    console.error("Error with YouTube video: ", videoSrc);
    trackEvent("exception", {props:
        {
            description: errorMessage,
            fatal: false
        }
    });
}

export function IsaacVideo(props: IsaacVideoProps) {
    const dispatch = useAppDispatch();
    const userConsent = useUserConsent();
    const {doc: {src, altText}} = props;
    const page = useAppSelector(selectors.doc.get);
    const pageId = page && page !== NOT_FOUND && page.id || undefined;
    const embedSrc = src && rewrite(src);
    const errorSrc = src || altText || "Unknown embedded video.";
    const altTextToUse = `Embedded YouTube video: ${altText || src}.`;
    const printSummary = 'Embedded YouTube video' + (altText ? `: ${altText}` : '') + ` (${src}).`;

    const videoRef = useCallback( (node: any) => { // This isn't great but I couldn't figure out the actual type
        const $window: any = window;
        if (node !== null && $window.YT) {
            try {
                $window.YT.ready(function() {
                    new $window.YT.Player(node, {
                        events: {
                            'onReady': (event: any) => {
                                if (event?.target?.getDuration && event.target.getDuration() <= 0) {
                                    trackYoutubeError(errorSrc, "youtube_error: video loaded, but has no duration");
                                }
                            },
                            'onStateChange': (event: any) => {
                                onPlayerStateChange(event, eventDetails => dispatch(logAction(eventDetails)), pageId);
                            },
                            'onError': (event: any) => {
                                trackYoutubeError(errorSrc, `youtube_error: player error code ${event?.data}`);
                            }
                        }
                    });
                });
            } catch (error: any) {
                trackYoutubeError(errorSrc + ", " + error.stack, `youtube_error: ${error?.message || 'problem with YT library'}`);
            }
        }
    }, [dispatch, pageId]);


    const detailsForPrintOut = <div className="only-print py-2 mb-4">
        {printSummary}
    </div>;

    const accordionSectionContext = useContext(AccordionSectionContext);
    const videoInAnAccordionSection = accordionSectionContext.open !== null;

    // Exit early if a parent accordion section is closed (for the sake of pages containing many videos)
    if (videoInAnAccordionSection && !accordionSectionContext.open) {
        return detailsForPrintOut;
    }

    return <div>
        <div className="no-print content-value text-center">
            { embedSrc ?
                <div className={classNames("content-video-container", {"ratio-16x9" : userConsent.cookieConsent?.youtubeCookiesAccepted ?? false})}>
                    <YoutubeCookieHandler afterAcceptedElement={
                        <iframe ref={videoRef} className="mw-100" title={altTextToUse} src={embedSrc} allowFullScreen/>
                    } />
                </div>
                : altText
            }
        </div>
        {detailsForPrintOut}
    </div>;
}
