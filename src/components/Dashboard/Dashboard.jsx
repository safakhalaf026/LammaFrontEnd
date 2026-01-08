import { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import * as testService from '../../services/testService'
import { useNavigate } from 'react-router-dom'

import MapComponent from './MapComponent' 
import "./Dashboard.css"
import NavBar from '../NavBar/NavBar'

const Dashboard = () => {
    const navigate = useNavigate()
    
    // Access the user object from UserContext
    const { user } = useContext(UserContext)

    // Create state to store the message we'll receive from the backend
    const [message, setMessage] = useState('')

    //Create state to track the users location 
    const [userLocation, setUserLocation] = useState(null);


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
    
    function handleAddService(){
        navigate('/service/new')
    };

    //لاخذ موقع المستخدم و تتبعه
    useEffect(() => {
        // طلب ومراقبة موقع المستخدم بشكل مستمر
        const watchId = navigator.geolocation.watchPosition(   //watchPosition لتتبع الموقع باستمرار 
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting location:", error);
            },
            {
                enableHighAccuracy: true,   //use real GPS
            }
        );

        //   ايقاف المراقبه عند الخروج من الصفحه
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []); 


    return (
        <>
            <div className="layout-container">

                <div className="header-info">
                <h1>Welcome, {user?.displayName}</h1>
                <p>
                    Discover available services around you using the interactive map below.
                    Browse, compare, and choose the service that best fits your needs.
                </p>
                </div>
            <div className="services">
                  {user?.role === 'Service Provider' && (
                    <button 
                        onClick={() => handleAddService() } >
                     Add New Service        
                   </button>
                )}
            </div>

            <main className="map-area">
                <MapComponent userLocation={userLocation} />
            </main>
            </div>

        </>
    )
}

export default Dashboard