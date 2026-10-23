import { IsaacRevisionDetailPageDTO } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

const revisionApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getRevisionPage: build.query<IsaacRevisionDetailPageDTO, {id: string}>({
            query: ({id}) => ({
                url: `/pages/revision/detail/${id}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to fetch revision page."
            }),
            providesTags: (page) => {
                const boards = page?.gameboards?.map((gb) => ({type: "Gameboard" as const, id: gb.id})) || [];
                return [...boards]; // required to refetch decks inside the detail page if saved status is updated
            }
        }),
    })
});

export const { 
    useGetRevisionPageQuery, 
} = revisionApi;
