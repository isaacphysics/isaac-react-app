import React from "react";
import { Row } from "reactstrap";
import { useDeviceSize } from "../../services";
import { NewsCard } from "./cards/NewsCard";
import { selectors, useAppSelector, useGetNewsPodListQuery } from "../../state";
import { Link } from "react-router";
import { TextBlock } from "./layout/TextBlock";
import { IconCard } from "./cards/IconCard";
import { useLinkableSetting } from "../../services/linkableSetting";

export const AdaStoriesSection = ({isDashboard}: {isDashboard?: boolean}) => {
    const deviceSize = useDeviceSize();
    const {data: careersPods} = useGetNewsPodListQuery({subject: "cs_stories"});
    const userPreferences = useAppSelector(selectors.user.preferences);
    const showNewsletterPrompts = isDashboard && !userPreferences?.EMAIL_PREFERENCE?.NEWS_AND_UPDATES;
    const {setLinkedSetting} = useLinkableSetting();

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
        {showNewsletterPrompts &&
            <Row xs={12} className={"mt-7"}>
                <IconCard
                    card={{
                        title: "Stay updated",
                        icon: {name: "icon-mail", color: "tertiary"},
                        bodyText: "Get fresh teaching ideas, student study tips, and development news about our tools and resources delivered straight to your inbox.",
                        clickUrl: "/account#notifications",
                        buttonText: "Get tips and updates",
                        onButtonClick: () => {setLinkedSetting("news-preference");},
                        className: "px-0"
                    }}
                />
            </Row>
        }
    </>;
};
    