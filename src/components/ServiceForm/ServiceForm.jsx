// Safa Khalaf
import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as serviceService from '../../services/serviceService'

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

    const handleCoords = () => {
        return new Promise((resolve, reject) => {
            window.navigator.geolocation.getCurrentPosition(resolve, reject)
        })
    }

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
        try {

            const position = await handleCoords()
            const lat = String(position.coords.latitude)
            const long = String(position.coords.longitude)
            const newFormState = { ...formState, latitude: lat, longitude: long }
            const data = await serviceService.create(newFormState)
            
            if (serviceToUpdate) {
                const updatedService = await serviceService.update(serviceToUpdate._id, newFormState)
                if (updatedService) {
                    navigate('/')
                } else {
                    console.log('Update failed')
                }
            } else {
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
                    <button type="submit">{serviceToUpdate?'Update Service': 'Create Service'}</button>
                    <button onClick={() => navigate('/')}>Cancel</button>
                </div>
            </form>
        </main>
    )
}

export default ServiceForm
