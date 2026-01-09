// Safa Khalaf
import { useState,useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import * as serviceService from '../../services/serviceService'
import styles from './ServiceForm.module.css'
import '../../app.css'

function ServiceForm({ updateService, serviceToUpdate }) {
    const navigate = useNavigate()
    const { serviceId } = useParams()
    const [formState, setFormState] = useState(serviceToUpdate ? serviceToUpdate : {
        serviceName: '',
        category: '',
        description: '',
        pricing: 'Free',
        amount: 0,
        latitude: '',
        longitude: '',
    })

    // this is returns most recent edit without the need to refresh
    useEffect(() => {
        const loadServiceForEdit = async () => {
            if (!serviceId) return
            const latest = await serviceService.show(serviceId)
            if (latest) setFormState(latest)
        }
        loadServiceForEdit()
    }, [serviceId])

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

            if (serviceId) {
                const updatedService = await serviceService.update(serviceId, newFormState)
                if (updatedService) {
                    navigate(`/service/${serviceId}`)
                } else {
                    console.log('Update failed')
                }
            } else {
                const data = await serviceService.create(newFormState)
                if (data) {
                    updateService(data)
                    navigate(`/service/${data._id}`)
                } else {
                    console.log('Create failed')
                }
            }
        } catch (err) {
            console.log('Geolocation or submit failed:', err)
            setPopupMsg('Please allow location access to create a service.')
            setPopupOpen(true)
        }
    }
    return (
        <main className={styles.main}>
            <h1>Service Form</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                    <label className={styles.label} htmlFor='serviceName'>Service Name:</label>
                    <input
                        type='text'
                        id='serviceName'
                        value={serviceName}
                        name='serviceName'
                        onChange={handleChange}
                        required
                        className={styles.input}
                    />
                </div>
                <div>
                    <label className={styles.label} htmlFor='category'>Category:</label>
                    <select
                        id='category'
                        value={category}
                        name='category'
                        onChange={handleChange}
                        required
                        className={styles.select} >                        
                        <option value="">Select Category</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Education">Education</option>
                        <option value="Cooking">Cooking</option>
                        <option value="Tailoring">Tailoring</option>
                        <option value="Programming">Programming</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className={styles.label} htmlFor='description'>Description:</label>
                    <textarea
                        id='description'
                        value={description}
                        name='description'
                        onChange={handleChange}
                        className={styles.input}
                    />
                </div>
                <div>
                    <label className={styles.label} htmlFor='pricing'>Pricing:</label>
                    <select
                        id='pricing'
                        value={pricing}
                        name='pricing'
                        onChange={handleChange}
                        required
                        className={styles.select}>
                        <option value="Free">Free</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Service Exchange">Service Exchange</option>
                    </select>
                </div>
                {pricing === 'Fixed' && (
                    <div>
                        <label className={styles.label} htmlFor='amount'>Amount:</label>
                        <input
                            type='number'
                            id='amount'
                            value={amount}
                            name='amount'
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                )}

                <div>
                    <button className={styles.button} type="submit">{serviceToUpdate ? 'Update Service' : 'Create Service'}</button>
                    <button className={styles.button} onClick={() => navigate('/')}>Cancel</button>
                </div>
            </form>
        </main>
    )
}

export default ServiceForm
