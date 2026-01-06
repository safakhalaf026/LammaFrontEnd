import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReviewForm from './ReviewForm'
import axios from 'axios'

const ServiceDetails = () => {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)

      // Get service details
      const sRes = await axios.get(`/services/${id}`)
      setService(sRes.data.service)

      // Get reviews
      const rRes = await axios.get(`/reviews/${id}`)
      setReviews(rRes.data.reviews || [])
    } catch (error) {
      alert(error.response?.data?.error || 'Error loading service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading) return <p>Loading...</p>
  if (!service) return <p>Service not found</p>

  return (
    <div>
      <h2>{service.serviceName}</h2>
      <p>{service.description}</p>
      <p>Average Rating: {service.ratingStats?.average || 0}</p>
      <p>Total Reviews: {service.ratingStats?.count || 0}</p>

      <h3>Reviews</h3>
      {reviews.map(r => (
        <div key={r._id}>
          <p>Rating: {r.rating}</p>
          <p>Comment: {r.comment}</p>
          <p>By: {r.customer?.displayName}</p>
        </div>
      ))}

      <ReviewForm serviceId={id} onSubmitted={loadData} />
    </div>
  )
}

export default ServiceDetails
