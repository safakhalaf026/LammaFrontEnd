import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import ReviewForm from '../ReviewForm/ReviewForm'
import { UserContext } from '../../contexts/UserContext'
import * as serviceService from '../../services/serviceService'
import * as reviewService from '../../services/reviewService'

const ServiceDetails = ({findServicesToUpdate,deleteService}) => {
  const navigate = useNavigate()
  const {user} = useContext(UserContext)
  const { serviceId } = useParams()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)

      // Get service details
      const sRes = await serviceService.show(serviceId)
      setService(sRes)

      // Get reviews
      const rRes = await reviewService.getReviews(serviceId)
      setReviews(rRes || [])
    } catch (error) {
      alert(error.response?.data?.error || 'Error loading service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [serviceId])

  const handleDelete = async ()=>{
    const deletedService = await serviceService.remove(serviceId)
    deleteService(serviceId)
    navigate('/')
  }

  if (loading) return <p>Loading...</p>
  if (!service) return <p>Service not found</p>

  return (
    <div>
      <h2>{service.serviceName}</h2>
      <p>{service.description}</p>
      <p>Average Rating: {service.ratingStats?.average || 0}</p>
      <p>Total Reviews: {service.ratingStats?.count || 0}</p>


      <Link onClick={()=> findServicesToUpdate(serviceId)} to={`/service/${serviceId}/update`}>Edit</Link>
      <button onClick={handleDelete}>Delete Service</button>

      <h3>Reviews</h3>
      {reviews.map(r => (
        <div key={r._id}>
          <p>Rating: {r.rating}</p>
          <p>Comment: {r.comment}</p>
          <p>By: {r.customer?.displayName}</p>
        </div>
      ))}

      <ReviewForm serviceId={serviceId} onSubmitted={loadData} />
    </div>
  )
}

export default ServiceDetails
