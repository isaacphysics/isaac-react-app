import React, {useEffect} from "react";
import ResponsiveCarousel from "./Carousel";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {getNewsPodList} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {NewsCard} from "./cards/NewsCard";
import {IsaacPodDTO} from "../../../IsaacApiTypes";

export const NewsCarousel = () => {
    const dispatch = useDispatch();
    const newsState = useSelector((state: AppState) => state && state.news);
    useEffect(() => {
        dispatch(getNewsPodList("news"));
    }, []);

    return <ShowLoading until={newsState} thenRender={({news}) => <div>
        <ResponsiveCarousel groupingLimit={3}>
            {newsState?.news?.sort((a: IsaacPodDTO, b: IsaacPodDTO) => {
                if (a.id && b.id) {
                    if (a.id > b.id) {
                        return 1;
                    }

                    if (a.id <b.id) {
                        return -1;
                    }

                    return 0;
                }

                return 0;
            }).map((newsItem: IsaacPodDTO, index: number) => <NewsCard newsItem={newsItem} key={index} />)}
        </ResponsiveCarousel>
    </div>} />
};
