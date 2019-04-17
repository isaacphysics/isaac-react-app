import React from "react";
import {Link} from "react-router-dom";
import {ALL_TOPICS} from "../../services/constants";
import {TopicLinkDTO} from "../../../IsaacAppTypes";
import {Badge} from "reactstrap";

export const AllTopicsPage = () => {
    const renderTopicLink = (topicName: string, topicProperties: TopicLinkDTO) => {
        const examBoardTags = topicProperties.onlyFor &&
            <>{topicProperties.onlyFor.map((examBoard, index) => <Badge color="dark" key={index}>{examBoard}</Badge>)}</>;
        const comingSoonBadge = topicProperties.comingSoon && <Badge color="light">Coming Soon</Badge>;
        const className = topicProperties.comingSoon ? "disabled" : "";
        return <React.Fragment>
            <Link to={topicProperties.destination} className={className}>
                {topicName}{" "}{examBoardTags}{" "}{comingSoonBadge}
            </Link>
        </React.Fragment>
    };

    return <React.Fragment>
        <h1>All topics</h1>

        <hr />

        <div className="row">
            {Object.keys(ALL_TOPICS).map((categoryHeading, index) => {
                const category = ALL_TOPICS[categoryHeading];
                return <div key={index} className="col">
                    <h2>{categoryHeading}</h2>
                    {Object.keys(category).map((subCategoryHeading, index) => {
                        const subCategory = category[subCategoryHeading];
                        return <React.Fragment key={index}>
                            <h3>{subCategoryHeading}</h3>
                            <ul>{Object.keys(subCategory).map((topicName, index) => {
                                const topicLink = subCategory[topicName];
                                return <li className="list-unstyled" key={index}>
                                    {renderTopicLink(topicName, topicLink)}
                                </li>
                            })}</ul>
                        </React.Fragment>
                    })}
                </div>
            })}
        </div>
    </React.Fragment>
};
