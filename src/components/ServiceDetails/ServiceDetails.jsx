import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import ReviewForm from '../ReviewForm/ReviewForm'
import { UserContext } from '../../contexts/UserContext'
import * as serviceService from '../../services/serviceService'
import * as reviewService from '../../services/reviewService'
import styles from './ServiceDetails.module.css'

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

  useEffect(() => {
    loadData()
  }, [serviceId])

  const handleDelete = async () => {
    await serviceService.remove(serviceId)
    deleteService(serviceId)
    navigate('/')
  }

  if (loading) return <p className={styles.loading}>Loading...</p>
  if (!service) return <p className={styles.notFound}>Service not found</p>

  const isOwner = user?._id === service?.provider
  const isServiceManager = user?.role === 'Service Provider' && isOwner

  return (
    <div className={styles.container}>
      {/* Service header */}
      <h2 className={styles.h2}>{service.serviceName}</h2>
      <p className={styles.reviewText}>{service.description}</p>

      {/* Stats */}
      <div className={styles.statBoxWrapper}>
        <div className={styles.statBox}>
          <h4>Average Rating</h4>
          <div>{service.ratingStats?.average || 0}</div>
        </div>
        <div className={styles.statBox}>
          <h4>Total Reviews</h4>
          <div>{service.ratingStats?.count || 0}</div>
        </div>
      </div>

      {/* Action buttons for service owner */}
      {isServiceManager && (
        <div className={styles.actionButtons}>
          <Link
            className={styles.editBtn}
            onClick={() => findServicesToUpdate(serviceId)}
            to={`/service/${serviceId}/update`}
          >
            Edit
          </Link>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete Service
          </button>
        </div>
      )}

      {/* Reviews section */}
      <h3 className={styles.h3}>Reviews</h3>
      <div className={styles.reviewGrid}>
        {reviews.map((r) => (
          <div key={r._id} className={styles.reviewCard}>
            <div className={styles.stars}>
              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
            </div>
            <p className={styles.reviewText}>{r.comment}</p>
            <span className={styles.reviewerName}>{r.customer?.displayName}</span>
          </div>
        ))}
      </div>

      {/* Review form for non-owners */}
      {!isOwner && (
        <div className={styles.reviewFormContainer}>
          <ReviewForm serviceId={serviceId} onSubmitted={loadData} />
        </div>
      )}
    </div>
  )
}

export default ServiceDetails
