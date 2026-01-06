// Safa Khalaf
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import * as serviceService from '../../services/serviceService'
import { UserContext } from '../../contexts/UserContext';

function ServiceForm({ updateService, serviceToUpdate }) {
    const navigate = useNavigate()
    const [formState, setFormState] = useState(serviceToUpdate ? serviceToUpdate : {
        serviceName: '',
        category: '',
        description: '',
        pricing: 'Free',
        amount: '',
        latitude: '',
        longitude: '',
    })

    const { serviceName, category, description, pricing, amount } = formState

    const handleChange = (event) => {
        let { name, value } = event.target
        if (name === "amount") {
            value = Number(value)
        }
        const newFormState = { ...formState, [name]: value }
        setFormState(newFormState)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        window.navigator.geolocation.getCurrentPosition(
            async (position) => {
                const payload = {
                    ...formState,
                    latitude: String(position.coords.latitude),
                    longitude: String(position.coords.longitude),
                }
            }
        )
        try {
            if (serviceToUpdate) {
                const updatedService = await serviceService.update(serviceToUpdate._id, payload)
                if (updatedService) {
                    navigate('/')
                } else {
                    console.log('Update failed')
                }
            } else {
                const data = await serviceService.create(payload)
                if (data) {
                    updateService(data)
                    navigate('/')
                } else {
                    console.log('Create failed')
                }
            }
        } catch (err) {
            console.log('Geolocation or submit failed:', err)
            alert('Please allow location access to create a service.')
        }
    }
    return (
        <main>
            <h1>Service Form</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='serviceName'>Service Name:</label>
                    <input
                        type='text'
                        id='serviceName'
                        value={serviceName}
                        name='serviceName'
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='category'>Category:</label>
                    <select
                        id='category'
                        value={category}
                        name='category'
                        onChange={handleChange}
                        required >
                        <option value="Maintenance">Maintenance</option>
                        <option value="Education">Education</option>
                        <option value="Cooking">Cooking</option>
                        <option value="Tailoring">Tailoring</option>
                        <option value="Programming">Programming</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor='description'>Description:</label>
                    <input
                        type='text'
                        id='description'
                        value={description}
                        name='description'
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor='pricing'>Pricing:</label>
                    <select
                        id='pricing'
                        value={pricing}
                        name='pricing'
                        onChange={handleChange}
                        required >
                        <option value="Free">Free</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Service Exchange">Service Exchange</option>
                    </select>
                </div>
                {pricing === 'Fixed' && (
                    <div>
                        <label htmlFor='amount'>amount:</label>
                        <input
                            type='number'
                            id='amount'
                            value={amount}
                            name='amount'
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <div>
                    <button>Submit</button>
                    <button onClick={() => navigate('/')}>Cancel</button>
                </div>
            </form>
        </main>
    )
}

export default ServiceForm

