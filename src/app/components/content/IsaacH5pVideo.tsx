import React, {useEffect, useState} from 'react';
import {VideoDTO} from "../../../IsaacApiTypes";
import {api} from "../../services";
import PlayH5p from '../site/phy/PlayH5p';
import { StyledSelect } from '../elements/inputs/StyledSelect';
import { Button } from 'reactstrap';

interface IsaacH5pVideoProps {
    doc: VideoDTO;
}

export function IsaacH5pVideo(props: IsaacH5pVideoProps) {
    const {doc: {src, altText}} = props;
    const altTextToUse = `Embedded YouTube video: ${altText || src}.`;
    const url = window.location.origin;

    const [video, setVideo] = useState<string>(url + "/h5p/si-base-units");
    useEffect(() => {
        setVideo("");
    }, [video]);

    const detailsForPrintOut = <div className="only-print py-2 mb-4">
        {altTextToUse}
    </div>;

    const interactiveVideos = [{ label: "Base Units", value: url + "/h5p/si-base-units" }, { label: "Homepage Video", value: url + "/h5p/homepage-video"},  { label: "Homepage Video 2", value: url + "/h5p/homepage-video-2" }];
    
    return <div>
        <div className="no-print content-value text-center">
            <PlayH5p h5pJsonPath={video} />
            <div className="d-inline-flex"/>
            <StyledSelect 
                defaultValue={interactiveVideos[0]} 
                options={interactiveVideos} 
                onChange={(e) => setVideo(e ? e.value : "")}
            />
            <Button size="sm" className="mt-2" onClick={() => api.interactiveVideos.get("1")}>Request</Button>
        </div>
        {detailsForPrintOut}
    </div>;
}
