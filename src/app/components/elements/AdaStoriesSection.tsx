import React from "react";
import { Row } from "reactstrap";
import { useDeviceSize } from "../../services";
import { NewsCard } from "./cards/NewsCard";
import { useGetNewsPodListQuery } from "../../state";
import { Link } from "react-router";
import { TextBlock } from "./layout/TextBlock";

export const AdaStoriesSection = () => {
    const deviceSize = useDeviceSize();
    const {data: careersPods} = useGetNewsPodListQuery({subject: "cs_stories"});

    return (careersPods && careersPods.length > 0) && <>
        <TextBlock>
            <h2>Explore a career in computer science</h2>
            <p>Read stories from graduates at the early stages of their careers in software development, game design, research, and much more.</p> 
        </TextBlock>
        <Row xs={12} className="d-flex flex-row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 isaac-cards-body justify-content-around mb-1">
            {careersPods.slice(0, deviceSize === "lg" ? 3 : 4).map((c, i) => <NewsCard key={i} newsItem={c} showTitle cardClassName="bg-cultured-grey" />)}
        </Row>
        <div className="d-flex justify-content-center mt-6">
            <Link to="/pages/computer_science_stories" target="_blank">
                <strong className="link-dark-pink">View more stories</strong>
            </Link>
            <strong className="link-dark-pink">&gt;</strong>
        </div>
    </>;
};
    