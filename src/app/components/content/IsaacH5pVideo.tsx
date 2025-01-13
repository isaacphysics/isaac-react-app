import React, {useEffect, useState} from 'react';
import {H5pVideoDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services";
import PlayH5p from '../site/phy/PlayH5p';
import { StyledSelect } from '../elements/inputs/StyledSelect';
import { YoutubeCookieHandler } from '../handlers/InterstitialCookieHandler';

interface IsaacH5pVideoProps {
    doc: H5pVideoDTO;
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

export function IsaacH5pVideo(props: IsaacH5pVideoProps) {
    const {doc: {src, altText}} = props;

    const path = (src?: string) => src ? apiHelper.determineImageUrl(src) : "";
    const altTextToUse = `Embedded YouTube video: ${altText || src}.`;

    const [video, setVideo] = useState<string>(path(src) ?? "");
    useEffect(() => {
        setVideo("");
    }, [video]);

    const detailsForPrintOut = <div className="only-print py-2 mb-4">
        {altTextToUse}
    </div>;

    const interactiveVideos = [
        { label: "Base Units", value: path("./content/beta_pages/sol/hackathon/figures/si-base-units.json") }, 
        { label: "Homepage Video", value: path("./content/beta_pages/sol/hackathon/figures/Why-use-Isaac-Physics.json")},  
        { label: "Homepage Video 2", value: path("./content/beta_pages/sol/hackathon/figures/Why-use-Isaac-Physics-2.json")}
    ];
    
    return <div>
        <div className="no-print content-value text-center">
            <PlayH5p h5pJsonPath={video} />
            <div className="d-inline-flex"/>
            <StyledSelect 
                className="mb-1"
                defaultValue={interactiveVideos[0]} 
                options={interactiveVideos} 
                onChange={(e) => setVideo(e ? e.value : "")}
            />
            <div className="d-inline-flex"/>
        </div>
        {detailsForPrintOut}
    </div>;
}
