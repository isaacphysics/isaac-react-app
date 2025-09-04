import React from "react";
import { Row, Button, Container } from "reactstrap";
import { IsaacPodDTO } from "../../../IsaacApiTypes";
import { useDeviceSize } from "../../services";
import { IconCard } from "./cards/IconCard";
import { NewsCard } from "./cards/NewsCard";
import classNames from "classnames";

interface AdaNewsSectionProps {
    news?: IsaacPodDTO[];
    showNewsletterPrompts: boolean;
    setLinkedSetting: (targetId: string) => void;
    isHomepage?: boolean;
}

export const AdaNewsSection = ({news, showNewsletterPrompts, setLinkedSetting, isHomepage}: AdaNewsSectionProps) => {
    const deviceSize = useDeviceSize();
    return <Container className={isHomepage ? "homepage-padding mw-1600" : "overview-padding mw-1600"}>
        <h2 className={isHomepage ? "font-size-1-75 mb-4" : ""}>Tips, tools & support</h2>
        {news && news.length > 0 &&
            <>
                <Row xs={12} data-testid={"news-pod-deck"} className="d-flex flex-row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 isaac-cards-body justify-content-around mt-3 mb-1">
                    {news.slice(0, deviceSize === "lg" ? 3 : 4).map((n, i) => <NewsCard key={i} newsItem={n} showTitle cardClassName="bg-cultured-grey" />)}
                </Row>
                <div className={"mt-4 mt-lg-5 w-100 text-center"}>
                    <Button href={"/news"} color={"link"}><h4 className={"mb-0"}>See more</h4></Button>
                </div>
            </>}
        {showNewsletterPrompts &&
            <Row xs={12} className={classNames({"pt-4": !isHomepage}, "mt-7")}>
                <IconCard
                    card={{
                        title: "Stay updated",
                        icon: {src: "/assets/cs/icons/mail.svg"},
                        bodyText: "Get fresh teaching ideas, student study tips, and development news about our tools and resources delivered straight to your inbox.",
                        clickUrl: "/account#notifications",
                        buttonText: "Get tips and updates",
                        onButtonClick: () => {setLinkedSetting("news-preference");},
                        className: isHomepage ? "bg-cultured-grey px-0" : "px-0"
                    }}
                />
            </Row>
        }
    </Container>;
};
    