import { H5P } from "h5p-standalone";
import React, { useEffect, useRef } from "react";
import { useUserConsent } from "../../../services";
import { YoutubeCookieHandler } from "../../handlers/InterstitialCookieHandler";

interface H5pProps {
    h5pJsonPath: string;
}

function PlayH5p({ h5pJsonPath }: H5pProps) {
    const h5pContainer = useRef(null);

    useEffect(() => {
        const h5pElement = h5pContainer.current;
        const options = {
            h5pJsonPath,
            frameJs: window.location.origin + "/assets/common/frame.bundle.js",
            frameCss: window.location.origin + "/assets/common/h5p.css",
            librariesPath: window.location.origin + "/h5p/Libraries",
            // customCss: "/assets/common/h5p2.css",
            //frame: false,
            //icon: true,
            export: true,
            fullScreen: true,
        };
        return () => {
            new H5P(h5pElement, options)
                .catch((e: Error) => {
                    console.log("Error: ", e);
                });
        };
    }, [h5pJsonPath, h5pContainer]);

    const UserConsent = useUserConsent();
    const cn = "h5p-container" + (UserConsent.cookieConsent?.youtubeCookieAccepted ? "" : " d-none");

    return (
        <div className="content-video-container ratio-16x9">
            <div className={cn} ref={h5pContainer}/>
        </div>
    );
}

export default PlayH5p;
