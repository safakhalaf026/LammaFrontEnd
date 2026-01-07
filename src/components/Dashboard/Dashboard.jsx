import { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import * as testService from '../../services/testService'
import { useNavigate } from 'react-router-dom'

import MapComponent from './MapComponent'
import ServiceCard from '../ServiceCard/ServiceCard'


const Dashboard = () => {
    const navigate = useNavigate()

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
    function handleAddService() {

        navigate('/service/new')

    };

    return (
        <>
            <main>
                <h1>Welcome, {user?.username}</h1>
                <p>
                    This is the dashboard page where you can see a list of all the users.
                </p>
                <p><strong>{message}</strong></p>

                {user?.role === 'Service Provider' && (
                    <button

                        onClick={() => handleAddService()}
                    >
                        Add New Service
                    </button>
                )}

            </main>
            <div>
                <MapComponent />
            </div>

        </>
    )
}


export default Dashboard

