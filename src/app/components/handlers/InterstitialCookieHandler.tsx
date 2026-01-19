import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import classNames from 'classnames';
import { interstitialCookieSlice, useAppDispatch } from '../../state';
import { SOCIAL_LINKS, useUserConsent } from '../../services';
import { IsaacVideo } from '../content/IsaacVideo';

const youtubeHomepageCookieText = <p className="text-muted m-0"><small>We use YouTube to show you videos on our website. By clicking the above, you agree to Google&apos;s <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer"><b>Cookie Policy</b></a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"><b>Privacy Policy</b></a>.</small></p>;
const youtubeCookieText = <p>We use YouTube to show you videos on our website. We ask for your permission before loading the content, as YouTube may be using cookies to help them track usage and improve their services.<br/><br/>You may wish to read Google&apos;s <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer"><b>Cookie Policy</b></a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"><b>Privacy Policy</b></a> before accepting.</p>;
const anvilCookieText = <p>We use Anvil to show you interactive content on our website. We ask for your permission before loading the content, as Anvil may be using cookies to help them track usage and improve their services.<br/><br/>You may wish to read Anvil&apos;s <a href="https://anvil.works/privacy" target="_blank" rel="noopener noreferrer"><b>Privacy Policy</b></a> before accepting.</p>;
const desmosCookieText = <p>We use Desmos to show you interactive content on our website. We ask for your permission before loading the content, as Desmos may be using cookies or other monitoring tools to help them track usage and improve their services.<br/><br/>You may wish to read Desmos&apos;s <a href="https://www.desmos.com/privacy" target="_blank" rel="noopener noreferrer"><b>Privacy Policy</b></a> before accepting.</p>;
const geogebraCookieText = <p>We use GeoGebra to show you interactive content on our website. We ask for your permission before loading the content, as GeoGebra may be using cookies or other monitoring tools to help them track usage and improve their services.<br/><br/>You may wish to read GeoGebra&apos;s <a href="https://www.geogebra.org/privacy" target="_blank" rel="noopener noreferrer"><b>Privacy Policy</b></a> before accepting.</p>;

export interface InterstitialCookieHandlerProps {
    accepted: boolean;
    beforeAccepted: JSX.Element;
    afterAccepted: JSX.Element;
}

export const InterstitialCookieHandler = (props: InterstitialCookieHandlerProps) => {    
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(interstitialCookieSlice.actions.setDefault());
    }, []);

    return props.accepted ? <>{props.afterAccepted}</> : <>{props.beforeAccepted}</>;
};

export const HomepageYoutubeCookieHandler = () => {
    const [autoplay, setAutoplay] = useState(false);
    const [videoActive, setVideoActive] = useState(false);
    const [copyActive, setCopyActive] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const dispatch = useAppDispatch();
    const userConsent = useUserConsent();

    return <InterstitialCookieHandler
        accepted={userConsent.cookieConsent?.youtubeCookieAccepted ?? false}
        beforeAccepted={<div className="homepage-video">
            <div className="position-relative">
                <div className="youtube-fade" />
                <div className="youtube-header w-100">
                    <div className="d-flex align-items-center">
                        {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- content in css */}
                        <a className="channel-icon" href={SOCIAL_LINKS.youtube.href}/>
                        <a className="video-name" href="https://www.youtube.com/watch?v=kWA2AISiHXQ">Why use Isaac Physics?</a>
                    </div>
                    <div className="copy-container d-flex flex-column align-items-center">
                        <button className={classNames("copy-link m-0", {"copied" : linkCopied}, {"selected" : copyActive})} onClick={() => {
                            navigator.clipboard.writeText("https://www.youtube.com/watch?v=kWA2AISiHXQ");
                            setLinkCopied(true);
                        }} onMouseLeave={() => setLinkCopied(false)}
                        onFocus={() => setCopyActive(true)} onBlur={() => setCopyActive(false)}/>
                        <div className="copy-text">{linkCopied ? "Copied!" : "Copy Link"}</div>
                    </div>
                </div>
                <button className={`youtube-play w-100 h-100 p-0 m-0 ${videoActive ? "selected" : ""}`} type="button" onClick={() => {
                    dispatch(interstitialCookieSlice.actions.acceptYoutubeCookies());
                    setAutoplay(true);
                }} onFocus={() => setVideoActive(true)} onBlur={() => setVideoActive(false)}>
                </button>
                <img data-testid={"yt-thumbnail"} src="/assets/phy/isaac-homepage-video-thumbnail.jpeg" alt="A group of students solving problems at an in-person Isaac event." className="w-100 h-100"/>
            </div>
            {youtubeHomepageCookieText}
        </div>}
        afterAccepted={<IsaacVideo
            doc={{src: `https://www.youtube-nocookie.com/embed/kWA2AISiHXQ?enablejsapi=1&rel=0&fs=1&autoplay=${autoplay ? 1 : 0}&modestbranding=1&origin=home`, altText: "Isaac Physics introduction video"}}
        />}
    />;
};

export const YoutubeCookieHandler = ({afterAcceptedElement} : {afterAcceptedElement: JSX.Element}) => {
    const dispatch = useAppDispatch();
    const userConsent = useUserConsent();

    return <InterstitialCookieHandler
        accepted={userConsent.cookieConsent?.youtubeCookieAccepted ?? false}
        beforeAccepted={<div className="interstitial-cookie-page">
            <h3>Allow YouTube content?</h3>
            {youtubeCookieText}
            <div className="w-100 d-flex justify-content-center">
                <Button className="" onClick={() => {
                    dispatch(interstitialCookieSlice.actions.acceptYoutubeCookies());
                }}>Accept</Button>
            </div>
        </div>}
        afterAccepted={<>{afterAcceptedElement}</>}
    />;
};

export const AnvilCookieHandler = ({afterAcceptedElement} : {afterAcceptedElement: JSX.Element}) => {
    const dispatch = useAppDispatch();
    const userConsent = useUserConsent();

    return <InterstitialCookieHandler
        accepted={userConsent.cookieConsent?.anvilCookieAccepted ?? false}
        beforeAccepted={<div className="interstitial-cookie-page">
            <h3>Allow Anvil content?</h3>
            {anvilCookieText}
            <div className="w-100 d-flex justify-content-center">
                <Button onClick={() => {
                    dispatch(interstitialCookieSlice.actions.acceptAnvilCookies());
                }}>Accept</Button>
            </div>
        </div>}
        afterAccepted={<>{afterAcceptedElement}</>}
    />;
};

export const DesmosCookieHandler = ({afterAcceptedElement} : {afterAcceptedElement: JSX.Element}) => {
    const dispatch = useAppDispatch();
    const userConsent = useUserConsent();
    
    return <InterstitialCookieHandler
        accepted={userConsent.cookieConsent?.desmosCookieAccepted ?? false}
        beforeAccepted={<div className="interstitial-cookie-page">
            <h3>Allow Desmos content?</h3>
            {desmosCookieText}
            <div className="w-100 d-flex justify-content-center">
                <Button onClick={() => {
                    dispatch(interstitialCookieSlice.actions.acceptDesmosCookies());
                }}>Accept</Button>
            </div>
        </div>}
        afterAccepted={<>{afterAcceptedElement}</>}
    />;
};

export const GeogebraCookieHandler = ({afterAcceptedElement, onAccepted} : {afterAcceptedElement: JSX.Element, onAccepted?: () => void}) => {
    const dispatch = useAppDispatch();
    const userConsent = useUserConsent();
    
    return <InterstitialCookieHandler
        accepted={userConsent.cookieConsent?.geogebraCookieAccepted ?? false}
        beforeAccepted={<div className="interstitial-cookie-page">
            <h3>Allow GeoGebra content?</h3>
            {geogebraCookieText}
            <div className="w-100 d-flex justify-content-center">
                <Button onClick={() => {
                    dispatch(interstitialCookieSlice.actions.acceptGeogebraCookies());
                    onAccepted?.();
                }}>Accept</Button>
            </div>
        </div>}
        afterAccepted={<>{afterAcceptedElement}</>}
    />;
};
