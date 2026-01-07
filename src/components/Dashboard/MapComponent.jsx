import React from 'react'
import { useState, useEffect, useRef, useCallback ,useNavigate } from 'react'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import "./MapComponent.css"

const INITIAL_CENTER = [50.5500, 26.0667]
const INITIAL_ZOOM = 9.8

const MapComponent = () => {

    const mapRef = useRef(null)
    const mapContainerRef = useRef(null)
    const markersRef = useRef([]);

    const [center, setCenter] = useState(INITIAL_CENTER)
    const [zoom, setZoom] = useState(INITIAL_ZOOM)
    const [serviceData, setServiceData] = useState(null)
    //احضار الدبابيس الخاصه في المنطقه الظاهره فقط امام المستخدم
const getBboxAndFetch = useCallback(async () => {
        if (!mapRef.current) return;
        const bounds = mapRef.current.getBounds();
        const token = localStorage.getItem('token');
        try {
            
        const response = await axios.get(`${import.meta.env.VITE_BACK_END_SERVER_URL}/service`, {
                params: {
                minlatitude: bounds._sw.lat,
                maxlatitude: bounds._ne.lat,
                minlongitude: bounds._sw.lng,
                maxlongitude: bounds._ne.lng
            },
            headers: {
                Authorization: `Bearer ${token}`}
            });

            setServiceData(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);
//رسم الخريطه
useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: center,
            zoom: zoom,
            style: 'mapbox://styles/mapbox/standard',
        });

        mapRef.current.on('move', () => {
            const mapCenter = mapRef.current.getCenter();
            const mapZoom = mapRef.current.getZoom();
            setCenter([mapCenter.lng, mapCenter.lat]);
            setZoom(mapZoom);
        });

        mapRef.current.on('load', getBboxAndFetch);
        mapRef.current.on('moveend', getBboxAndFetch);

        return () => mapRef.current.remove();
    }, []);

const handleReset = () => {
        mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM });
    };

 
useEffect(() => {
    //  اذا ما في خريطه لا تعمل شي
    if (!mapRef.current || !serviceData) return;
    //حتى لا تتكرر الدبابيس
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    //رسم الدبابيس
    // نمر على الخدمات
    const services = serviceData.services || [];
    services.forEach((service) => {
        //بيانات الخدمه
        const longitude = parseFloat(service.longitude);
        const latitude = parseFloat(service.latitude);
        
        const defaultAvatar = "../../images/af.png";

            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="mini-popup">
                   <h2>${service.serviceName}</h2>
                   <img 
                        src="${service.provider?.avatar || defaultAvatar}" 
                        alt="${service.provider?.username || 'provider'}" 
                        class="avatar" 
                    />
                    <p>
                        ${service.provider?.displayName || 'Unknown'} 
                    </p>
                    <div class="rating">
                        <span>⭐ ${service.ratingStats?.average || 0} (${service.ratingStats?.count || 0})</span>
                    </div>
                    
                    
                    <button id="view-btn-${service._id}" class="popup-btn" >
                        Details
                    </button>
                </div>`
            );
        //  هنا رسم الخريطه
       const marker = new mapboxgl.Marker({ color: 'red' }) 
            .setLngLat([longitude, latitude]) //الموقع
            .setPopup(popup)
            .addTo(mapRef.current); // اضفه للخريطه

            markersRef.current.push(marker); 
         
            
    });

}, [serviceData]); // فقط عند تغير البيانات

    return (
       <>
        <button className='reset-button' onClick={handleReset}>
            Reset
        </button>

        <div className="sidebar">
            Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
        </div>

        <div id='map-container' ref={mapContainerRef} />
    </>
    )
};

export default MapComponent;