import React from "react";
import { NewsCard } from "./cards/NewsCard";
import { IsaacPodDTO } from "../../../IsaacApiTypes";

export const TeacherPromoItem = ({ item }: { item: IsaacPodDTO | undefined }) => (
  <div className={"my-lg-1 mx-auto p-lg-4 featured-news-item"}>
    {item && <NewsCard newsItem={item} showTitle linkText={item.subtitle} />}
  </div>
);
