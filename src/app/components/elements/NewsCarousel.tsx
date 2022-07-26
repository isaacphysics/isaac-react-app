import React, {RefObject, useEffect} from "react";
import ResponsiveCarousel from "./Carousel";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {getNewsPodList} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {NewsCard} from "./cards/NewsCard";
import {IsaacPodDTO} from "../../../IsaacApiTypes";
import ReactDOM from "react-dom";
import {isDefined} from "../../services/miscUtils";
import {above, useDeviceSize} from "../../services/device";

interface NewsCarouselProps {
    subject: "news" | "physics";
    descending?: boolean;
    showTitle?: boolean;
    className?: string;
    featuredNewsItemRef?: RefObject<HTMLElement>;
}

export const NewsCarousel = (props: NewsCarouselProps) => {
    const {descending, subject, showTitle, className, featuredNewsItemRef} = props;
    const dispatch = useAppDispatch();
    const newsState = useAppSelector((state) => state?.news);
    const deviceSize = useDeviceSize();

    useEffect(() => {
        dispatch(getNewsPodList(subject));
    }, [dispatch, subject]);

    function compare(a?: IsaacPodDTO | null, b?: IsaacPodDTO | null) {
        let value;
        if (a === b) value = 0;
        if (!isDefined(a?.id)) value = -1;
        else if (!isDefined(b?.id)) value = 1;
        else value = (a?.id as string).localeCompare(b?.id as string); // TS can't figure out the types unfortunately
        return descending ? value * -1 : value;
    }

    return <ShowLoading until={newsState} thenRender={({news}) => {
        const sortedNews = [...news].sort(compare); // Spread operator to avoid mutating redux state.
        const [featuredItem, ...carouselItems] =
            featuredNewsItemRef?.current && above["lg"](deviceSize) ? sortedNews : [null, ...sortedNews];

        return <div>
            {/* Render featured news item at the ref location if it is available */}
            {featuredItem && featuredNewsItemRef?.current && ReactDOM.createPortal(
                <NewsCard newsItem={featuredItem} showTitle={showTitle} />,
                featuredNewsItemRef.current
            )}

            {/* Render the remaining cards in the carousel */}
            <ResponsiveCarousel groupingLimit={3} className={className}>
                {carouselItems?.map((newsItem) =>
                    newsItem && <NewsCard newsItem={newsItem} showTitle={showTitle} key={newsItem.id} />
                )}
            </ResponsiveCarousel>
        </div>
    }} />
};
