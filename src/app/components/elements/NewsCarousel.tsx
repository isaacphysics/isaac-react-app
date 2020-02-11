import React, {useEffect} from "react";
import ResponsiveCarousel from "./Carousel";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {getNewsPodList} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {NewsCard} from "./cards/NewsCard";
import {IsaacPodDTO} from "../../../IsaacApiTypes";

interface NewsCarouselProps {
    descending?: boolean;
}

export const NewsCarousel = (props: NewsCarouselProps) => {
    const {descending} = props;
    const dispatch = useDispatch();
    const newsState = useSelector((state: AppState) => state && state.news);
    useEffect(() => {
        dispatch(getNewsPodList("news"));
    }, []);

    function compare(a: IsaacPodDTO, b: IsaacPodDTO) {
        if (descending) {
            if (a.id && b.id) {
                if (a.id < b.id) {
                    return 1;
                }

                if (a.id > b.id) {
                    return -1;
                }
            }
            return 0;
        } else {
            if (a.id && b.id) {
                if (a.id > b.id) {
                    return 1;
                }

                if (a.id < b.id) {
                    return -1;
                }
            }
            return 0;
        }
    }

    return <ShowLoading until={newsState} thenRender={({news}) => <div>
        <ResponsiveCarousel groupingLimit={3}>
            {news?.sort(compare).map((newsItem: IsaacPodDTO, index: number) => <NewsCard newsItem={newsItem} key={index} />)}
        </ResponsiveCarousel>
    </div>} />
};
