import { useEffect, useState } from "react";
import { AppGroup } from "../../../../../IsaacAppTypes";
import { isaacApi } from "../../../../state";

export const useActiveGroups = () => {
  const [activeGroups, setActiveGroups] = useState<AppGroup[]>([]);
  const { data: groups } = isaacApi.endpoints.getGroups.useQuery(false);

  useEffect(() => {
    if (groups) {
      setActiveGroups(
        groups.filter((group): group is AppGroup & { groupName: string } => group.groupName !== undefined),
      );
    }
  }, [groups]);

  return activeGroups;
};
