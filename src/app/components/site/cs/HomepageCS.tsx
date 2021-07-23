import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {SITE_SUBJECT_TITLE} from "../../../services/siteConstants";
import {WhySignUpTabs} from "../../elements/WhySignUpTabs";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {FeaturedContentTabs} from "../../elements/FeaturedContentTabs";
import {EventsCarousel} from "../../elements/EventsCarousel";
import {selectors} from "../../../state/selectors";

export const HomepageCS = () => {
    useEffect( () => {document.title = "Isaac " + SITE_SUBJECT_TITLE;}, []);
    const user = useSelector(selectors.user.orNull);

    return <div id="homepage">
        <section id="call-to-action" className="homepageHero">
            <Container>
                <Row>
                    <Col lg="5" className="pb-5 pt-4 py-sm-5">
                        <Row>
                            <Col>
                                <h1>{
                                    user && user.loggedIn ? `Welcome ${user.givenName}!` : "Computer Science learning"
                                }</h1>
                                <p>
                                    Welcome to Isaac Computer Science, the free online platform for students and teachers.
                                </p>
                                <ul>
                                    <li>Use it in the <strong>classroom</strong></li>
                                    <li>Use it for <strong>homework</strong></li>
                                    <li>Use it for <strong>revision</strong></li>
                                </ul>
                                <Container>
                                    <Row className="flex-nowrap">
                                        <Col>
                                            <svg className="ml-lg-0 mt-5 mt-lg-4 ml-md-5 w-100 w-md-75 w-lg-100" style={{fill: "#007fa2"}} aria-label="Teach Computing Logo" viewBox="0 0 221 119" version="1.1"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <title>
                                                    Teach Computing
                                                </title>
                                                <g transform="translate(-1883.000000, -1060.000000)">
                                                    <path d="M1913.1 1060L2021.6 1060 2021.6 1102.1 2104 1102.1 2104 1148.8 2073.9 1179 1896.5 1179 1896.5 1136.9 1883 1136.9 1883 1090.2 1913.1 1060ZM1917.6 1102.1L2017.1 1102.1 2017.1 1064.5 1917.6 1064.5 1917.6 1102.1ZM1931.2 1106.7L1931.2 1144.2 2099.5 1144.2 2099.5 1106.7 2021.6 1106.7 1931.2 1106.7ZM1933.1 1076.2L1927.3 1076.2 1927.3 1072.4 1943.5 1072.4 1943.5 1076.2 1937.7 1076.2 1937.7 1091.9 1933.1 1091.9 1933.1 1076.2ZM1949.9 1077.3C1954.3 1077.3 1957.4 1080.4 1957.4 1084.9 1957.4 1085.2 1957.4 1085.8 1957.3 1086.1L1946.4 1086.1C1946.7 1088.1 1948.1 1089.3 1949.9 1089.3 1951.5 1089.3 1952.8 1088.5 1953.2 1087.2L1956.9 1087.7C1956.2 1090.5 1953.2 1092.5 1949.8 1092.5 1945.3 1092.5 1942.1 1089.3 1942.1 1084.8 1942.1 1080.4 1945.3 1077.3 1949.9 1077.3ZM1953.2 1083.6C1953 1081.8 1951.6 1080.5 1949.8 1080.5 1948 1080.5 1946.7 1081.7 1946.4 1083.6L1953.2 1083.6ZM1970.1 1077.9L1974.2 1077.9 1974.2 1091.9 1970.1 1091.9 1970.1 1090C1969 1091.6 1967.3 1092.5 1965.3 1092.5 1961.4 1092.5 1958.6 1089.4 1958.6 1084.9 1958.6 1080.5 1961.4 1077.3 1965.3 1077.3 1967.3 1077.3 1969 1078.3 1970.1 1079.8L1970.1 1077.9ZM1970 1084.9C1970 1082.6 1968.5 1081 1966.4 1081 1964.3 1081 1962.7 1082.6 1962.7 1084.9 1962.7 1087.2 1964.3 1088.9 1966.4 1088.9 1968.5 1088.9 1970 1087.2 1970 1084.9ZM1990.8 1082.9L1987 1083.4C1986.6 1081.9 1985.2 1080.8 1983.7 1080.8 1981.7 1080.8 1980.1 1082.5 1980.1 1084.9 1980.1 1087.3 1981.7 1089 1983.7 1089 1985.3 1089 1986.6 1087.9 1987 1086.4L1990.8 1086.9C1990.3 1090.2 1987.3 1092.5 1983.7 1092.5 1979.3 1092.5 1976 1089.3 1976 1084.9 1976 1080.5 1979.2 1077.3 1983.7 1077.3 1987.3 1077.3 1990.4 1079.7 1990.8 1082.9ZM1996.7 1071.6L1996.7 1079.5C1997.7 1078.1 1999.3 1077.3 2001 1077.3 2004.3 1077.3 2006.4 1079.7 2006.4 1083L2006.4 1091.9 2002.3 1091.9 2002.3 1083.9C2002.3 1082.2 2001.3 1081 1999.6 1081 1998.1 1081 1996.7 1082.3 1996.7 1084L1996.7 1091.9 1992.6 1091.9 1992.6 1071.6 1996.7 1071.6ZM1958.1 1125.4L1962.4 1126C1961.7 1130.3 1957.7 1133.4 1952.7 1133.4 1946.7 1133.4 1942.3 1129 1942.3 1122.9 1942.3 1116.9 1946.7 1112.5 1952.7 1112.5 1957.6 1112.5 1961.7 1115.6 1962.4 1120.1L1958.1 1120.6C1957.5 1118.1 1955.4 1116.4 1952.8 1116.4 1949.4 1116.4 1946.9 1119.1 1946.9 1122.9 1946.9 1126.7 1949.4 1129.4 1952.8 1129.4 1955.3 1129.4 1957.5 1127.7 1958.1 1125.4ZM1979.3 1125.7C1979.3 1130.1 1976.1 1133.2 1971.5 1133.2 1966.9 1133.2 1963.8 1130.1 1963.8 1125.7 1963.8 1121.2 1966.9 1118.1 1971.5 1118.1 1976.1 1118.1 1979.3 1121.2 1979.3 1125.7ZM1975.2 1125.7C1975.2 1123.4 1973.7 1121.7 1971.5 1121.7 1969.4 1121.7 1967.9 1123.4 1967.9 1125.7 1967.9 1128 1969.4 1129.6 1971.5 1129.6 1973.7 1129.6 1975.2 1128 1975.2 1125.7ZM1981.1 1132.7L1981.1 1118.6 1985.1 1118.6 1985.1 1120.3C1985.9 1118.9 1987.5 1118.1 1989.2 1118.1 1991.2 1118.1 1992.9 1119 1993.7 1120.6 1994.6 1119 1996.4 1118.1 1998.4 1118.1 2001.6 1118.1 2003.8 1120.5 2003.8 1123.9L2003.8 1132.7 1999.7 1132.7 1999.7 1124.7C1999.7 1123 1998.6 1121.8 1997.1 1121.7 1995.5 1121.7 1994.4 1123 1994.4 1124.7L1994.4 1132.7 1990.3 1132.7 1990.3 1124.7C1990.3 1122.9 1989.3 1121.7 1987.8 1121.7 1986.2 1121.7 1985.2 1122.9 1985.2 1124.7L1985.2 1132.7 1981.1 1132.7ZM2014.7 1133.2C2012.8 1133.2 2011.2 1132.4 2010.1 1131L2010.1 1139 2006 1139 2006 1118.6 2010 1118.6 2010 1120.3C2011.1 1118.9 2012.8 1118.1 2014.7 1118.1 2018.6 1118.1 2021.3 1121.2 2021.3 1125.7 2021.3 1130.1 2018.6 1133.2 2014.7 1133.2ZM2017.2 1125.7C2017.2 1123.4 2015.7 1121.8 2013.6 1121.8 2011.4 1121.8 2009.9 1123.4 2009.9 1125.7 2009.9 1127.9 2011.4 1129.5 2013.6 1129.5 2015.7 1129.5 2017.2 1127.9 2017.2 1125.7ZM2033.2 1132.7L2033.2 1130.8C2032.2 1132.3 2030.6 1133.2 2028.7 1133.2 2025.6 1133.2 2023.5 1130.8 2023.5 1127.4L2023.5 1118.6 2027.6 1118.6 2027.6 1126.7C2027.6 1128.4 2028.5 1129.6 2030.2 1129.6 2031.8 1129.6 2033.1 1128.3 2033.1 1126.5L2033.1 1118.6 2037.2 1118.6 2037.2 1132.7 2033.2 1132.7ZM2040.7 1121.8L2038.8 1121.8 2038.8 1118.6 2040.9 1118.6 2041.4 1115.1 2044.8 1115.1 2044.8 1118.6 2048 1118.6 2048 1121.8 2044.8 1121.8 2044.8 1127.7C2044.8 1128.9 2045.5 1129.7 2046.7 1129.7 2047.1 1129.7 2047.7 1129.6 2048.1 1129.5L2048.1 1132.8C2047.3 1133.1 2046.2 1133.2 2045.3 1133.2 2042.5 1133.2 2040.7 1131.1 2040.7 1128.1L2040.7 1121.8ZM2050.3 1132.7L2050.3 1118.6 2054.4 1118.6 2054.4 1132.7 2050.3 1132.7ZM2050 1114.4C2050 1113.1 2051 1112.1 2052.4 1112.1 2053.8 1112.1 2054.7 1113.1 2054.7 1114.4 2054.7 1115.8 2053.8 1116.8 2052.4 1116.8 2051 1116.8 2050 1115.8 2050 1114.4ZM2061.2 1118.6L2061.2 1120.5C2062.2 1119 2063.8 1118.1 2065.7 1118.1 2068.8 1118.1 2071 1120.5 2071 1123.9L2071 1132.7 2066.9 1132.7 2066.9 1124.6C2066.9 1122.9 2065.9 1121.7 2064.3 1121.7 2062.6 1121.7 2061.3 1123 2061.3 1124.8L2061.3 1132.7 2057.2 1132.7 2057.2 1118.6 2061.2 1118.6ZM2083.8 1132.4L2083.8 1130.7C2082.7 1132.1 2081.1 1132.9 2079.2 1132.9 2075.3 1132.9 2072.5 1129.9 2072.5 1125.7 2072.5 1121.2 2075.3 1118.1 2079.2 1118.1 2081.1 1118.1 2082.7 1118.9 2083.8 1120.3L2083.8 1118.6 2087.9 1118.6 2087.9 1132.5C2087.9 1136.9 2084.8 1139.6 2080.4 1139.6 2076.6 1139.6 2073.5 1137.2 2073.1 1134L2076.7 1133.5C2077.1 1135.1 2078.6 1136.3 2080.2 1136.3 2082.3 1136.3 2083.8 1134.9 2083.8 1132.4ZM2084 1125.7C2084 1123.4 2082.4 1121.7 2080.3 1121.7 2078.2 1121.7 2076.6 1123.4 2076.6 1125.7 2076.6 1127.9 2078.2 1129.5 2080.3 1129.5 2082.4 1129.5 2084 1127.9 2084 1125.7Z"/>
                                                </g>
                                            </svg>
                                        </Col>
                                        <Col>
                                            <img className="w-100 w-md-75 w-lg-100" alt="NCCE Logo" src="https://www.stem.org.uk/sites/default/files/fieldable-panel-panes/rich-text/NCCE%20logo.png"/>
                                        </Col>
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg="7" className="pb-4 p-lg-5 align-self-center text-center">
                        <iframe
                            title="Isaac Computer Science introduction video" width="640" height="345" className="mw-100 pt-lg-4"
                            src="https://www.youtube-nocookie.com/embed/nW4J-NVDziw?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=home"
                            frameBorder="0" allowFullScreen
                        />
                    </Col>
                </Row>
                <Row>
                    <Col size={6} className="pt-3 text-center">
                        <Button size="lg" tag={Link} to={user && user.loggedIn ? "/topics" : "/register"} color="secondary" block>
                            {user && user.loggedIn ? "Find a topic" : "Sign up"}
                        </Button>
                    </Col>
                    <Col size={6} className="pt-3 text-center">
                        <Button size="lg" tag={Link} to={user && user.loggedIn ? "/search" : "/login"} color="primary" outline block>
                            {user && user.loggedIn ? "Search the site" : "Log in"}
                        </Button>
                    </Col>
                </Row>
            </Container>
        </section>

        {!(user && user.loggedIn) && <Container><hr /></Container>}

        {!(user && user.loggedIn) && <section id="why-sign-up" className="row sign-up-tabs">
            <Container>
                <Col className="pb-5 pt-4 pattern-04">
                    <h2 className="text-center mb-5">Why sign up?</h2>
                    <WhySignUpTabs />
                </Col>
            </Container>
        </section>}

        <section id="news">
            <Container className="pt-4 pb-5">
                <div className="eventList pt-5 pattern-03-reverse">
                    <h2 className="h-title mb-4">News</h2>
                    <NewsCarousel descending={true} subject="news" />
                </div>
            </Container>
        </section>

        <section id="headline-content" className="row bg-primary pattern-05">
            <Container>
                <Col className="py-5 pb-md-0">
                    <FeaturedContentTabs />
                </Col>
            </Container>
        </section>

        <section id="events">
            <Container className="pt-4 pb-5">
                <div className="eventList pt-5 pattern-03">
                    <h2 className="h-title text-center mb-4">Events</h2>
                    <p className="pt-4 pb-2 event-description text-center col-md-8 offset-md-2">
                        {"We offer free online events for students and teachers. Visit our "}
                        <Link to="/events">
                            Events page
                        </Link>
                        {" to see what’s happening, and sign up today!"}
                    </p>
                    <EventsCarousel />
                    <Link to="/events">
                        See all Events
                    </Link>
                </div>
            </Container>
        </section>

        {!(user && user.loggedIn) && <section className="row">
            <Container>
                <Col className="py-4 px-5 mb-5 d-flex align-items-center flex-column flex-md-row border border-dark">
                    <h3 className="text-center text-md-left mr-md-4 mr-lg-0 mb-3 mb-md-0">
                        Sign up to track your progress
                    </h3>
                    <Button tag={Link} size="lg" className="ml-md-auto mr-md-3 mr-lg-5 btn-xl" to={"/register"}>
                        Sign up
                    </Button>
                </Col>
            </Container>
        </section>}
    </div>
};
