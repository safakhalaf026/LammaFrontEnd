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

  return (
    <div className="main-container">
      <div className="nav-header">
        <div className="logo">Lamma</div>
        <div className="nav-buttons">
          <Link to="/dashboard" className="dashboard-btn">Dashboard</Link>
          <Link to="/logout" className="signout-btn">Sign Out</Link>
        </div>
      </div>

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
    </div>
  )
}

export default ServiceDetails
