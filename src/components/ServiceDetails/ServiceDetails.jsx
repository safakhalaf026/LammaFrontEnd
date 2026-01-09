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

  const handleDelete = async () => {
    const deletedService = await serviceService.remove(serviceId)
    deleteService(serviceId)
    navigate('/')
  }

  if (loading) return <p className='loading'>Loading...</p>
  if (!service) return <p className='not-found'>Service not found</p>

  // checks if logged in user is owner of the service (via refrencing)
  const isOwner = user?._id === service?.provider._id

  // checks if the logged in user has role === 'Service Provider' AND is the owner of the service
  const isServiceManager = user?.role === 'Service Provider' && isOwner

  return (
    <div className={styles.container}>
       <div id={styles['card-header']}> 
              <img 
                  src={service.provider.avatar ||defaultAvatar } 
                  alt={service.provider.username} 
                  className={styles.avatar}
              />
              <p>{service.provider.displayName} </p>
          </div>
      
      <h1 className={styles.title}>{service.serviceName}</h1>
      <h3 className={styles.description}>{service.description}</h3>
      <h5 className={styles.stats}>Average Rating: {service.ratingStats?.average || 0}</h5>
      <h5 className={styles.stats}>Total Reviews: {service.ratingStats?.count || 0}</h5>

      {/* edit/delete service functionality wont be shown if the logged in user is not the owner and has  */}
      {isOwner ? (
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
      ) : null}


      <h3 className={styles.sectionTitle}>Reviews</h3>
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

      {/* if the logged in user is NOT the owner of the service, the review form component will load   */}
      {!isOwner? (
        <div className={styles.reviewFormContainer}>
          <ReviewForm serviceId={serviceId} onSubmitted={loadData} />
        </div>
      ) : null}

    </div>
  )
}
export default ServiceDetails