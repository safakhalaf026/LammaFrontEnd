import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import ReviewForm from '../ReviewForm/ReviewForm'
import { UserContext } from '../../contexts/UserContext'
import * as serviceService from '../../services/serviceService'
import * as reviewService from '../../services/reviewService'
import './ServiceDetails.css'

const ServiceDetails = ({ findServicesToUpdate, deleteService }) => {
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const { serviceId } = useParams()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const sRes = await serviceService.show(serviceId)
      setService(sRes)
      const rRes = await reviewService.getReviews(serviceId)
      setReviews(rRes || [])
    } catch (error) {
      alert(error.response?.data?.error || 'Error loading service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [serviceId])

  const handleDelete = async () => {
    await serviceService.remove(serviceId)
    deleteService(serviceId)
    navigate('/')
  }

  if (loading) return <p className="loading">Loading...</p>
  if (!service) return <p className="not-found">Service not found</p>

  // checks if logged in user is owner of the service (via refrencing)
  const isOwner = user?._id === service?.provider 

  // checks if the logged in user has role === 'Service Provider' AND is the owner of the service
  const isServiceManager = user?.role === 'Service Provider' && isOwner

  return (
<<<<<<< HEAD
    <div className="main-container">
      <div className="nav-header">
        <div className="logo">Lamma</div>
        <div className="nav-buttons">
          <Link to="/dashboard" className="dashboard-btn">Dashboard</Link>
          <Link to="/logout" className="signout-btn">Sign Out</Link>
=======
    <div>
      <h2>{service.serviceName}</h2>
      <p>{service.description}</p>
      <p>Average Rating: {service.ratingStats?.average || 0}</p>
      <p>Total Reviews: {service.ratingStats?.count || 0}</p>

      {/* edit/delete service functionality wont be shown if the logged in user is not the owner and has  */}
      {!isServiceManager ? (
        <div>   
          <Link onClick={()=> findServicesToUpdate(serviceId)} to={`/service/${serviceId}/update`}>Edit</Link>
          <button onClick={handleDelete}>Delete Service</button>
        </div>
      ):null}


      <h3>Reviews</h3>
      {reviews.map(r => (
        <div key={r._id}>
          <p>Rating: {r.rating}</p>
          <p>Comment: {r.comment}</p>
          <p>By: {r.customer?.displayName}</p>
>>>>>>> ca95f6bf17e05495ac0451ceeed2adb498e76fc9
        </div>
      </div>

<<<<<<< HEAD
      <div className="content-wrapper">
        <div>
          <h2>{service.serviceName}</h2>
          <p className="review-text">{service.description}</p>
          <div className="action-buttons">
            <Link className="edit-btn" onClick={() => findServicesToUpdate(serviceId)} to={`/service/${serviceId}/update`}>Edit</Link>
            <button className="delete-btn" onClick={handleDelete}>Delete Service</button>
          </div>
        </div>

        <div>
          <div className="reviews-grid">
            {reviews.map(r => (
              <div key={r._id} className="review-card">
                <div className="stars">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                <p className="review-text">{r.comment}</p>
                <span className="reviewer-name">{r.customer?.displayName}</span>
              </div>
            ))}
          </div>

          <div className="review-form-container">
            <ReviewForm serviceId={serviceId} onSubmitted={loadData} />
          </div>
        </div>
      </div>
=======
      {/* if the logged in user is NOT the owner of the service, the review form component will load   */}
      {isOwner? (
        <ReviewForm serviceId={serviceId} onSubmitted={loadData} />
      ): null}
      
>>>>>>> ca95f6bf17e05495ac0451ceeed2adb498e76fc9
    </div>
  )
}

export default ServiceDetails
