import React from "react";
import {Link} from "react-router-dom";
import {ALL_TOPICS} from "../../services/constants";
import {TopicLink} from "../../../IsaacAppTypes";
import classNames from "classnames";
import {Badge} from "reactstrap";

export const AllTopicsPage = () => {
    const renderTopicLink = (topicName: string, topicProperties: TopicLink) => {
        const examBoardTags = topicProperties.onlyFor &&
            <React.Fragment>
                {topicProperties.onlyFor.map((examBoard) =>
                    <Badge color="dark">{examBoard}</Badge>)
                }
            </React.Fragment>;
        return <Link to={topicProperties.destination} className={classNames({"disabled": topicProperties.comingSoon})}>
            {topicName} {examBoardTags}
        </Link>
    };

    return <div className="row">
        {Object.keys(ALL_TOPICS).map((categoryHeading) => {
            const category = ALL_TOPICS[categoryHeading];
            return <div className="col">
                <h2>{categoryHeading}</h2>
                {Object.keys(category).map((subCategoryHeading) => {
                    const subCategory = category[subCategoryHeading];
                    return <React.Fragment>
                        <h3>{subCategoryHeading}</h3>
                        <ul>{Object.keys(subCategory).map((topicName) => {
                            const topicLink = subCategory[topicName];
                            return <li className="list-unstyled">
                                {renderTopicLink(topicName, topicLink)}
                            </li>
                        })}</ul>
                    </React.Fragment>
                })}
            </div>
        })}
    </div>
};
