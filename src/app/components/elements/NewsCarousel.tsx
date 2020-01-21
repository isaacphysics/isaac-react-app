import React, {useEffect} from "react";
import ResponsiveCarousel from "./Carousel";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {getNewsPodList} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {NewsCard} from "./cards/NewsCard";

export const NewsCarousel = () => {
    const dispatch = useDispatch();
    const newsState = useSelector((state: AppState) => state && state.news);
    useEffect(() => {
        dispatch(getNewsPodList("news"));
    }, []);

    return <ShowLoading until={newsState} thenRender={({news}) => <div>
        <ResponsiveCarousel groupingLimit={2}>
            {news.map((newsItem, index) => <NewsCard newsItem={newsItem} key={index} />)}
        </ResponsiveCarousel>
    </div>} />
};
