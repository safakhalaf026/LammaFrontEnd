import React from 'react'
import { useState, useEffect, useRef, useCallback ,useNavigate } from 'react'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import "./MapComponent.css"
import ServiceCard from '../ServiceCard/ServiceCard'

const INITIAL_CENTER = [50.5500, 26.0667]
const INITIAL_ZOOM = 9.8

const MapComponent = ({ userLocation }) => {

    const mapRef = useRef(null)
    const mapContainerRef = useRef(null)
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);  // لتتبع المستخدم
 


    const [center, setCenter] = useState(INITIAL_CENTER)
    const [zoom, setZoom] = useState(INITIAL_ZOOM)
    const [serviceData, setServiceData] = useState([])
    const [activeServiceId, setActiveServiceId] = useState(null);

    //احضار الدبابيس الخاصه في المنطقه الظاهره فقط امام المستخدم
const getBboxAndFetch = useCallback(async () => {
        if (!mapRef.current) return;
        const bounds = mapRef.current.getBounds();
        const token = localStorage.getItem('token');
        try {
            
        const response = await axios.get(`${import.meta.env.VITE_BACK_END_SERVER_URL}/service`, {
            //الخدمات التي تقعفي الجزء الظاهر من الخريطة فقط  
            //يعني فلتر للخدمات الموجوده في المنطقه الظاهره (البحرين)  
            params: {
                minlatitude: bounds._sw.lat,
                maxlatitude: bounds._ne.lat,
                minlongitude: bounds._sw.lng,
                maxlongitude: bounds._ne.lng
            },
            headers: {
                Authorization: `Bearer ${token}`}
            });
          const responseService = response.data.services
            setServiceData(responseService);
            console.log(responseService);
            console.log(response.data);
            
            
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
       // تحديث موقع الخريطة
        mapRef.current.on('move', () => {
            const mapCenter = mapRef.current.getCenter();
            const mapZoom = mapRef.current.getZoom();
            setCenter([mapCenter.lng, mapCenter.lat]);
            setZoom(mapZoom);
        });
       //أول ما تظهر الخريطة جيب الخدمات الموجودة داخلها
        mapRef.current.on('load', getBboxAndFetch);
        //بعد ما يوقف  المستخدم تحريك الخريطه يتم جلب الخدمات
        mapRef.current.on('moveend', getBboxAndFetch);

        return () => mapRef.current.remove();
    }, []);
    
    
    // رسم وتحديث موقع المستخدم
useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // إذا الماركر غير موجود  أنشئه
    if (!userMarkerRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ color: "blue" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    } else {
        // إذا موجود حدّث موقعه فقط
        userMarkerRef.current.setLngLat([
        userLocation.lng,
        userLocation.lat,
        ]);
    }
    }, [userLocation]);







 //اعاده تعيين الخريطه للاحداثيات الاصليه
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
const services = serviceData;
    services.forEach((service) => {
        //بيانات الخدمه
        const longitude = parseFloat(service.longitude);
        const latitude = parseFloat(service.latitude);
        
        const defaultAvatar = "../../images/af.png";
           //النافذه المنبثقه
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
        //  هنا رسم الماركر على الخريطة
       const marker = new mapboxgl.Marker({ color: 'red' }) 
            .setLngLat([longitude, latitude]) //الموقع
            .setPopup(popup)  //اضف النافذه المنبثقه
            .addTo(mapRef.current); // اضفه للخريطه

            //عند الضغط على الماركر
        marker.getElement().addEventListener("click", () => {
            setActiveServiceId(service._id);
            //ربط الماركر بالبطاقه
            const card = document.getElementById(`service-card-${service._id}`);
             if (card) {
                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
            
            });

            //   تخزين id & marker
            markersRef.current.push({
            id: service._id,  //للربطبين الماركر و البطاقه
            marker,
            });
         
            
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

        <div className='servicesList'>
        {serviceData.map(service => (
            //id مهم لعمل scroll
            <div key={service._id}  id={`service-card-${service._id}`}>    
            <ServiceCard
                service={service}
                isActive={activeServiceId === service._id}
                />
            </div>
        ))}
        </div>


    </>
    )
};

export default MapComponent;