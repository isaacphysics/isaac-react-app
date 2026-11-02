import React from "react";
import { Row, Button } from "reactstrap";
import { useDeviceSize } from "../../services";
import { NewsCard } from "./cards/NewsCard";
import { useGetNewsPodListQuery } from "../../state";

export const AdaStoriesSection = () => {
    const deviceSize = useDeviceSize();
    const {data: careersPods} = useGetNewsPodListQuery({subject: "cs_stories"});

    return (careersPods && careersPods.length > 0) && <>
        <h2>Computer Science Stories</h2>
        <Row xs={12} className="d-flex flex-row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 isaac-cards-body justify-content-around mt-3 mb-1">
            {careersPods.slice(0, deviceSize === "lg" ? 3 : 4).map((c, i) => <NewsCard key={i} newsItem={c} showTitle cardClassName="bg-cultured-grey" />)}
        </Row>
        <div className={"mt-4 mt-lg-5 w-100 text-center"}>
            <Button className="mb-0 h4" href={"/pages/computer_science_stories"} color={"link"}>See more</Button>
        </div>
    </>;
};
    