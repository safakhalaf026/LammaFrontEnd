import { useContext, useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import { UserContext } from '../../contexts/UserContext'
import * as testService from '../../services/testService'

import ServiceCard from '../ServiceCard/ServiceCard'
import './Dashboard.css'


const INITIAL_CENTER = [50.5500, 26.0667]
const INITIAL_ZOOM = 9.8

const Dashboard = () => {
    // Access the user object from UserContext
    const { user } = useContext(UserContext)

    // Create state to store the message we'll receive from the backend
    const [message, setMessage] = useState('')

    // useEffect runs after the component renders
    // This is where we perform side effects like API calls
    useEffect(() => {
        const fetchTest = async () => {
            try {
                // Make an authenticated API call to the backend test endpoint. The JWT token is automatically sent in the request headers inside the service function
                const data = await testService.test()

                // Take the response data and show message
                setMessage(data.message)
            } catch (err) {
                console.log(err)
            }
        }

        // Only fetch data if user exists (i.e., someone is logged in)
        // if (user===truthy) THEN run function
        // This prevents errors from trying to make authenticated requests without a user
        if (user) fetchTest()

    }, [user]) // only fetch if after context loads the user from localStorage


    // map
    // Stores the map object to control it later
    const mapRef = useRef(null)
    // References the HTML div where the map will be drawn
    const mapContainerRef = useRef(null)

    const [center, setCenter] = useState(INITIAL_CENTER)
    const [zoom, setZoom] = useState(INITIAL_ZOOM)
    const [serviceData, setServiceData] = useState();

    const getBboxAndFetch = useCallback(async () => {
        if (!mapRef.current) return; 
        const bounds = mapRef.current.getBounds();

        try {
            const response = await axios.get(import.meta.env.VITE_BACK_END_SERVER_URL, {
                params: {
                    minlatitude: bounds._sw.lat,
                    maxlatitude: bounds._ne.lat,
                    minlongitude: bounds._sw.lng,
                    maxlongitude: bounds._ne.lng
                }
            });

            setServiceData(response.data);
        } catch (error) {
            console.error( error);
        }
    }, []);

    useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: center,
        zoom: zoom,
        style: 'mapbox://styles/mapbox/standard',

  })
    mapRef.current.on('move', () => {
        // get the current center coordinates and zoom level from the map
        const mapCenter = mapRef.current.getCenter()
        const mapZoom = mapRef.current.getZoom()

        // update state
        setCenter([ mapCenter.lng, mapCenter.lat ])
        setZoom(mapZoom)

        
    })
   // تشغيل الجلب عند تحميل الخريطة وعند انتهاء الحركة
        mapRef.current.on('load', getBboxAndFetch);
        mapRef.current.on('moveend', getBboxAndFetch);

    return () => {
      mapRef.current.remove()
    }
  }, [getBboxAndFetch])



   
const handleButtonClick = () => {
  mapRef.current.flyTo({
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM
  })
}
//pin
// أضف هذا الـ useEffect قبل سطر الـ return
useEffect(() => {
    if (!serviceData || !mapRef.current) return;

    // مصفوفة لتخزين الـ Markers الحالية حتى نتمكن من إزالتها لاحقاً إذا أردت
    const currentMarkers = [];

    // نمر على كل خدمة موجودة في البيانات الجلوبال (GeoJSON)
    serviceData.features.forEach((feature) => {
        // 1. إنشاء عنصر HTML للدبوس (اختياري لتخصيص الشكل)
        const el = document.createElement('div');
        el.className = 'marker'; // يمكنك تصميمها في CSS

        // 2. إنشاء الدبوس وإضافته للخريطة
        const marker = new mapboxgl.Marker()
            .setLngLat(feature.geometry.coordinates)
            // إضافة نافذة منبثقة (Popup) تظهر عند الضغط على الدبوس
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }) 
                    .setHTML(`
                        <h4>${feature.properties.name || 'Service'}</h4>
                        <p>${feature.properties.description || 'No description'}</p>
                    `)
            )
            .addTo(mapRef.current);
        
        currentMarkers.push(marker);
    });

    // تنظيف الدبابيس عند تحديث البيانات (حتى لا تتكرر)
    return () => {
        currentMarkers.forEach(marker => marker.remove());
    };
}, [serviceData]);

return (
 <>
        <main>
            <h1>Welcome, {user.username}</h1>
            <p>
                This is the dashboard page where you can see a list of all the users.
            </p>
            <p><strong>{message}</strong></p>
        </main>
        <div>
              
                <button className='reset-button' onClick={handleButtonClick}>
                Reset
                </button>
                <div className="sidebar">
                Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
                </div>

            <div id='map-container' ref={mapContainerRef}/>

        </div>
        </>
)
}

 
export default Dashboard

