import { SiteBanner, useSiteBanners } from "../../../services/siteBanners";
import { isDefined } from "../../../services";

export const SiteBanners = () => {
    const siteBanners: SiteBanner[] = useSiteBanners();
    const now = new Date();

    return siteBanners.filter((banner) => (
        (!isDefined(banner.startDate) || now >= banner.startDate) && 
        (!isDefined(banner.endDate) || now <= banner.endDate)
    )).map(b => b.banner);
};
