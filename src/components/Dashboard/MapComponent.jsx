import { useState, useEffect, useRef, useCallback ,useNavigate } from 'react'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import ServiceCard from '../ServiceCard/ServiceCard'
import styles from "./MapComponent.module.css"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'; //للبحث في الخريطه
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language'; //للغه
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';



const INITIAL_CENTER = [ 50.5069 , 26.0642]
const INITIAL_ZOOM =  9.14

const MapComponent = ({ userLocation }) => {

    const mapRef = useRef(null)
    const mapContainerRef = useRef(null)
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);  // لتتبع المستخدم
    const hasCenteredRef = useRef(false) //لتحريك الخريطه في اول مره
 


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
            // center: center,
            // zoom: zoom,
           style: "mapbox://styles/mapbox/streets-v11"

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

    // خاص للبحث عن الموقع
        mapRef.current.addControl(
        new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        useBrowserFocus: true,
        mapboxgl: mapboxgl
      })
    );


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
   // تحريك الخريطه لموقع المستخدم لاول مره فقط
    if (!hasCenteredRef.current) {
    mapRef.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });
    hasCenteredRef.current = true;
    }
    
    }, [userLocation]);
    
    // تغيير لغة أسماء الدول
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




 //اعاده تعيين الخريطه للاحداثيات الاصليه
const handleReset = () => {
        mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM });
    };

 
useEffect(() => {
    //  اذا ما في خريطه لا تعمل شي
    if (!mapRef.current || !serviceData) return;
    //حتى لا تتكرر الدبابيس
      markersRef.current.forEach(item => item.marker.remove())
      markersRef.current = [];
    //رسم الدبابيس
    // نمر على الخدمات
const services = serviceData;
    services.forEach((service, idx) => {
        //بيانات الخدمه
        const longitude = parseFloat(service.longitude);
        const latitude = parseFloat(service.latitude);
        
        console.log(idx, service.provider.avatar)
        // const defaultAvatar = "../../images/af.png";
           //النافذه المنبثقه
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

        //لون لكل خدمه
        const categoryColors = {
            'Maintenance': '#D32F2F', 
            'Education': '#ed13e6ff',    
            'Cooking': '#FFA000',      
            'Tailoring': '#9C27B0',    
            'Programming': '#2E7D32',  
            'Other': '#607274'         
            };
                

        //   اللون اعتمادا على نوع الخدمة
         const markerColor = categoryColors[service.category] 
        //  هنا رسم الماركر على الخريطة
        const marker = new mapboxgl.Marker({
            color: markerColor
            })            
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
    <div style={{ height: "100vh", width: "100%", padding: "10px" }}>
      
      {/* أزرار تغيير اللغة */}
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
            //id مهم لعمل scroll
            
                <ServiceCard
                service={service}
                isActive={activeServiceId === service._id}  
                key={service.id}              
                />
           
           
                ))} 
               
        </div>
        <div style={{ height:'350px' }}> 
            <p style={{marginLeft:"55px",fontSize:"10px"}}>  No more Service</p>
              </div>
         </SimpleBar>

            
        <button className={styles['reset-button']} onClick={handleReset}>
            Reset the map of Bahrain
        </button>

        <div className={styles.sidebar}>
            Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
        </div>

        <div id={styles["map-container"]} ref={mapContainerRef}  />

    </div>
</div>
</>
    
    )
};

export default MapComponent;