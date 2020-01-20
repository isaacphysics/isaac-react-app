import React, {useState} from "react";
import {GoogleMap, InfoWindow, LoadScript, Marker, MarkerClusterer} from "@react-google-maps/api";
import {AugmentedEvent, EventMapData} from "../../../IsaacAppTypes";

interface InteractiveMapProps {
    getInfoWindow: (data: EventMapData) => any;
    locationData: EventMapData[];
}

export const InteractiveMap = (props: InteractiveMapProps) => {
    const {getInfoWindow, locationData} = props;
    const [markerMap, setMarkerMap] = useState<{[index: number]: Marker}>({});
    const [mapCenter, setMapCenter] = useState({lat: 52.205, lng: 0.119});
    const [selectedMarkerID, setSelectedMarkerID] = useState();
    const [infoOpen, setInfoOpen] = useState(false);
    return  <LoadScript
        id="script-loader"
        googleMapsApiKey="AIzaSyBcVr1HZ_JUR92xfQZSnODvvlSpNHYbi4Y"
    >
        <GoogleMap
            id='events-map'
            zoom={5}
            center={mapCenter}
        >
            <MarkerClusterer maxZoom={11}>
                {
                    (clusterer) => locationData.map((location, index) => <Marker
                        key={index}
                        position={{lat: location.latitude, lng: location.longitude}}
                        clusterer={clusterer}
                        onLoad={(marker) => {
                            setMarkerMap((prevState) => {
                                return {...prevState, [index]: marker}
                            });
                        }}
                        onClick={() => {
                            setInfoOpen(false);
                            selectedMarkerID != index ? setSelectedMarkerID(index) : setSelectedMarkerID(null);
                            setInfoOpen(true);
                        }}
                    />)
                }
            </MarkerClusterer>
            {infoOpen && selectedMarkerID != null && <InfoWindow
                anchor={markerMap[selectedMarkerID]}
                onCloseClick={() => setInfoOpen(false)}>
                {getInfoWindow(locationData[selectedMarkerID])}
            </InfoWindow>}
        </GoogleMap>
    </LoadScript>
};
