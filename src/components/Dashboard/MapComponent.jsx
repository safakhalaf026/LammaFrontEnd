import { useState, useEffect, useRef, useCallback, useNavigate } from 'react'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import ServiceCard from '../ServiceCard/ServiceCard'
import styles from "./MapComponent.module.css"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'; // tp search in map
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language'; // language
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const INITIAL_CENTER = [50.5934, 25.8356]
const INITIAL_ZOOM = 8.91

const MapComponent = ({ userLocation }) => {
    const mapRef = useRef(null)
    const mapContainerRef = useRef(null)
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);  // to track user on map
    const hasCenteredRef = useRef(false) // to center map 

    const [center, setCenter] = useState(INITIAL_CENTER)
    const [zoom, setZoom] = useState(INITIAL_ZOOM)
    const [serviceData, setServiceData] = useState([])
    const [activeServiceId, setActiveServiceId] = useState(null);

    // retrieve markers
    const getBboxAndFetch = useCallback(async () => {
        if (!mapRef.current) return;
        const bounds = mapRef.current.getBounds();
        const token = localStorage.getItem('token');
        try {

            const response = await axios.get(`${import.meta.env.VITE_BACK_END_SERVER_URL}/service`, {
                // filter to only show services in the kingdom of bahrain
                params: {
                    minlatitude: bounds._sw.lat,
                    maxlatitude: bounds._ne.lat,
                    minlongitude: bounds._sw.lng,
                    maxlongitude: bounds._ne.lng
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const responseService = response.data.services
            setServiceData(responseService);
        } catch (error) {
        }
    }, []);

    // draw map
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            // center: center,
            // zoom: zoom,
            style: "mapbox://styles/mapbox/streets-v11"
        });

        // update map location
        mapRef.current.on('move', () => {
            const mapCenter = mapRef.current.getCenter();
            const mapZoom = mapRef.current.getZoom();
            setCenter([mapCenter.lng, mapCenter.lat]);
            setZoom(mapZoom);
        });
        // fetch services when map appears
        mapRef.current.on('load', getBboxAndFetch);
        mapRef.current.on('moveend', getBboxAndFetch);

        // location search
        mapRef.current.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                useBrowserFocus: true,
                mapboxgl: mapboxgl
            })
        );
        return () => mapRef.current.remove();
    }, []);

    // construct and update user location
    useEffect(() => {
        if (!mapRef.current || !userLocation) return;

        // construct marker if not there
        if (!userMarkerRef.current) {
            userMarkerRef.current = new mapboxgl.Marker({ color: "blue" })
                .setLngLat([userLocation.lng, userLocation.lat])
                .addTo(mapRef.current);
        } else {
            // else update marker
            userMarkerRef.current.setLngLat([
                userLocation.lng,
                userLocation.lat,
            ]);
        }
        // centering map to user location (on mount only)
        if (!hasCenteredRef.current) {
            mapRef.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 14,
            });
            hasCenteredRef.current = true;
        }

    }, [userLocation]);

    // changing map language
    useEffect(() => {
        if (!mapRef.current) return;

        const languageControl = new MapboxLanguage({
            defaultLanguage: 'en'
        });

        mapRef.current.addControl(languageControl);
    }, []);

    const changeLanguage = (lang) => {
        if (!mapRef.current) return;

        const layers = mapRef.current.getStyle().layers;

        layers.forEach(layer => {
            if (layer.layout && layer.layout['text-field']) {
                mapRef.current.setLayoutProperty(
                    layer.id,
                    'text-field',
                    ['get', `name_${lang}`]
                );
            }
        });
    };

    // setting coordinates to original values
    const handleReset = () => {
        mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM });
    };


    useEffect(() => {
        //  if no map, dont do anything
        if (!mapRef.current || !serviceData) return;
        // to stop marker duplication
        markersRef.current.forEach(item => item.marker.remove())
        markersRef.current = [];
        // constructing markers by looping throughh services
        const services = serviceData;
        services.forEach((service, idx) => {
            // service coordinates
            const longitude = parseFloat(service.longitude);
            const latitude = parseFloat(service.latitude);
            const popupContent = `
            <div class="${styles['mini-popup']}">
                <h2 class="${styles['popup-title']}">${service.serviceName}</h2>
                <img 
                    src="${service.provider.avatar || "https://i.postimg.cc/2qtsw-YGj/af.png"}"
                    alt="provider" 
                    class=${styles.avatar}  
                />
                <p class="${styles['provider-name']}">
                    ${service.provider?.displayName || 'Unknown'} 
                </p>
                <div class="${styles.rating}">
                    <span>⭐ ${service.ratingStats?.average || 0} (${service.ratingStats?.count || 0})</span>
                </div>
            </div>`;

            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

            // unique marker color for each service
            const categoryColors = {
                'Maintenance': '#D32F2F',
                'Education': '#ed13e6ff',
                'Cooking': '#FFA000',
                'Tailoring': '#9C27B0',
                'Programming': '#2E7D32',
                'Other': '#607274'
            };

            const markerColor = categoryColors[service.category]

            // creating marker
            const marker = new mapboxgl.Marker({
                color: markerColor
            })
                .setLngLat([longitude, latitude]) // coordinates
                .setPopup(popup)  // adding popup (when marker is clicked)
                .addTo(mapRef.current); // adding marker to map

            // when marker is clicked
            marker.getElement().addEventListener("click", () => {
                setActiveServiceId(service._id);
                // map marker to the map
                const card = document.getElementById(`service-card-${service._id}`);
                if (card) {
                    card.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }

            });
            markersRef.current.push({
                id: service._id,
                marker,
            });


        });

    }, [serviceData]); // only when data is updated

    return (

        <>
            <div style={{ height: "100vh", width: "100%", padding: "10px" }}>

                {/* language buttons */}
                <div className={styles.languagesContainer}>
                    <button className={styles.langBtn} onClick={() => changeLanguage("en")}>English</button>
                    <button className={styles.langBtn} onClick={() => changeLanguage("fr")}>Français</button>
                    <button className={styles.langBtn} onClick={() => changeLanguage("de")}>Deutsch</button>
                    <button className={`${styles.langBtn} ${styles.langBtnAr}`} onClick={() => changeLanguage("ar")}>العربية</button>
                </div>

                <div className={styles['map-area']}>
                    <SimpleBar style={{ maxHeight: "100%" }}>
                        <div className={styles.servicesList} >
                            {serviceData.map(service => (
                                <div id={`service-card-${service._id}`} key={service._id}>
                                    <ServiceCard
                                        service={service}
                                        isActive={activeServiceId === service._id}
                                        key={service.id}
                                    />
                                </div>

                            ))}

                        </div>
                        <div style={{ height: '350px' }}>
                            <p style={{ marginLeft: "55px", fontSize: "10px" }}>  No more Service</p>
                        </div>
                    </SimpleBar>


                    <button className={styles['reset-button']} onClick={handleReset}>
                        Reset the map of Bahrain
                    </button>

                    <div className={styles.sidebar}>
                        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
                    </div>

                    <div id={styles["map-container"]} ref={mapContainerRef} />

                </div>
            </div>
        </>

    )
};

export default MapComponent;