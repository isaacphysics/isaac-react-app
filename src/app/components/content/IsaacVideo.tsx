import React, { useCallback, useContext } from "react";
import { VideoDTO } from "../../../IsaacApiTypes";
import { logAction, selectors, useAppDispatch, useAppSelector } from "../../state";
import { NOT_FOUND } from "../../services";
import ReactGA from "react-ga4";
import { AccordionSectionContext } from "../../../IsaacAppTypes";

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
    return (
      `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0&fs=1&modestbranding=1` +
      `${optionalStart}${optionalEnd}&origin=${window.location.origin}`
    );
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

  switch (event.data) {
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
  const iframes = document.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo" }), "*");
  });
}

export function IsaacVideo(props: IsaacVideoProps) {
  const dispatch = useAppDispatch();
  const {
    doc: { src, altText },
  } = props;
  const page = useAppSelector(selectors.doc.get);
  const pageId = (page && page !== NOT_FOUND && page.id) || undefined;
  const embedSrc = src && rewrite(src);
  const altTextToUse = `Embedded YouTube video: ${altText || src}.`;

  const videoRef = useCallback(
    (node: any) => {
      // This isn't great but I couldn't figure out the actual type
      const $window: any = window;
      if (node !== null && $window.YT) {
        try {
          $window.YT.ready(function () {
            new $window.YT.Player(node, {
              events: {
                onStateChange: (event: any) => {
                  onPlayerStateChange(event, (eventDetails) => dispatch(logAction(eventDetails)), pageId);
                },
              },
            });
          });
        } catch (error: any) {
          console.error("Error with YouTube library: ", error, error.stack);
          ReactGA.gtag("event", "exception", {
            description: `youtube_error: ${error?.message || "problem with YT library"}`,
            fatal: false,
          });
        }
      }
    },
    [dispatch, pageId],
  );

  const detailsForPrintOut = <div className="only-print py-2 mb-4">{altTextToUse}</div>;

  // Exit early if a parent accordion section is closed (for the sake of pages containing many videos)
  const accordionSectionContext = useContext(AccordionSectionContext);
  const videoInAnAccordionSection = accordionSectionContext.open !== null;
  if (videoInAnAccordionSection && !accordionSectionContext.open) {
    return detailsForPrintOut;
  }

  return (
    <div>
      <div className="no-print content-value text-center">
        {embedSrc ? (
          <div className="content-video-container">
            <iframe
              ref={videoRef}
              className="mw-100"
              title={altTextToUse}
              src={embedSrc}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        ) : (
          altText
        )}
      </div>
      {detailsForPrintOut}
    </div>
  );
}
