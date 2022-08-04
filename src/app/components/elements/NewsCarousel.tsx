import React, {useEffect} from "react";
import ResponsiveCarousel from "./Carousel";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {AppState} from "../../state/reducers";
import {getNewsPodList} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {NewsCard} from "./cards/NewsCard";
import {IsaacPodDTO} from "../../../IsaacApiTypes";

interface NewsCarouselProps {
    subject: "news" | "physics";
    descending?: boolean;
    showTitle?: boolean;
    className?: string;
}

export const NewsCarousel = (props: NewsCarouselProps) => {
    const {descending, subject, showTitle, className} = props;
    const dispatch = useAppDispatch();
    const newsState = useAppSelector((state: AppState) => state && state.news);
    useEffect(() => {
        dispatch(getNewsPodList(subject));
    }, [dispatch, subject]);

    function compare(a: IsaacPodDTO, b: IsaacPodDTO) {
        if (a.id && b.id) {
            if (a.id < b.id) {
                return descending ? 1 : -1;
            }

            if (a.id > b.id) {
                return descending ? -1 : 1;
            }
        }
        return 0;
    }

    return <ShowLoading until={newsState} thenRender={({news}) => <div>
        <ResponsiveCarousel groupingLimit={3} className={className}>
            {news?.sort(compare).map((newsItem: IsaacPodDTO, index: number) => <NewsCard newsItem={newsItem} showTitle={showTitle} key={index} />)}
        </ResponsiveCarousel>
    </div>} />
};
