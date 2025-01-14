import React from "react";
import ResponsiveCarousel from "./Carousel";
import {ShowLoading} from "../handlers/ShowLoading";
import NewsPod from "./NewsPod";
import {IsaacPodDTO} from "../../../IsaacApiTypes";

type NewsCarouselProps = {
    items: IsaacPodDTO[] | undefined;
    showTitle?: boolean;
    className?: string;
};

export const NewsCarousel = ({items, showTitle, className}: NewsCarouselProps) =>
    <ShowLoading until={items} thenRender={(newsPods) => <div>
        <ResponsiveCarousel className={className}>
            {newsPods.slice(0, 9).map((newsItem: IsaacPodDTO, index: number) => <NewsPod newsItem={newsItem} key={index} />)}
        </ResponsiveCarousel>
    </div>} />;
