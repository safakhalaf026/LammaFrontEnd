import { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import * as testService from '../../services/testService'
import { useNavigate } from 'react-router-dom'
import 'animate.css';
import MapComponent from './MapComponent' 
import styles from "./Dashboard.module.css"

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

    useEffect(() => {
        // retrieve and track logged in user location
        const watchId = navigator.geolocation.watchPosition(   
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

        // stop tracking location
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []); 


    return (
       
    <>
        <div className={styles['layout-container']}>
           <div className={`${styles['header-info']} animate__animated animate__fadeInDown`}>       
                 <h1>
                    Welcome, <span>{user?.displayName}</span>
                </h1>

                <p>
                    Find trusted services around you using the interactive map.
                    Compare options and choose what fits you best.
                </p>
                </div>

        <div className={`${styles.services} animate__animated animate__fadeInDown`}>            
                {user?.role === 'Service Provider' && (
                    <button onClick={() => handleAddService()}>
                        Add New Service        
                    </button>
                )}
            </div>

           
            <div className={`${styles['map-area']} animate__animated animate__slideInUp`}>
                <MapComponent userLocation={userLocation} />
            </div>
            
        </div>
    </>
);
       
    
}

export default Dashboard