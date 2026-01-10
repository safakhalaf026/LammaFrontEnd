import { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import ReviewForm from '../ReviewForm/ReviewForm'
import { UserContext } from '../../contexts/UserContext'
import * as serviceService from '../../services/serviceService'
import * as reviewService from '../../services/reviewService'
import styles from './ServiceDetails.module.css'
import Swal from 'sweetalert2'
import 'animate.css'

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
      Swal.fire({
        icon: "error",
        title: "Error Loading Service",
        text: "This service can't be loaded.",
      })
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

  // checks if logged in user is owner of the service (via refrencing)
  const isOwner = user?._id === service?.provider?._id

  const pricingText =
    service.pricing === 'Fixed'
      ? `${service.pricing} • ${service.amount ?? 0} BHD`
      : service.pricing

  return (
    <div className={`${styles.container} animate__animated animate__fadeIn`}>
      <div className={styles.cardHeader}>
        <img
          src={service.provider?.avatar || 'https://i.postimg.cc/2qtsw-YGj/af.png'}
          alt={service.provider?.username}
          className={styles.avatar}
        />

        <div className={styles.providerInfo}>
          <p className={styles.providerName}>
            {service.provider?.displayName}
          </p>
          <span className={styles.providerUsername}>
            @{service.provider?.username}
          </span>
        </div>
      </div>

      <h1 className={styles.title}>{service.serviceName}</h1>
      <h3 className={styles.description}>{service.description}</h3>

      <div className={styles.statsRow}>
        <span className={styles.stats}>
          Average Rating: {service.ratingStats?.average || 0}
        </span>
        <span className={styles.stats}>
          Total Reviews: {service.ratingStats?.count || 0}
        </span>
      </div>

      {/* clearer service details */}
      <div className={styles.detailsBox}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Category</span>
            <span className={styles.detailValue}>{service.category}</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Pricing</span>
            <span className={styles.detailValue}>{pricingText}</span>
          </div>
        </div>
      </div>

      {/* edit/delete service functionality wont be shown if the logged in user is not the owner */}
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
        {reviews.length === 0 ? (
          <p className={styles.noReviews}>No reviews yet</p>
        ) : (
          reviews.map((eachReview) => (
            <div key={eachReview._id} className={styles.reviewCard}>
              <div className={styles.stars}>
                {'★'.repeat(eachReview.rating)}
                {'☆'.repeat(5 - eachReview.rating)}
              </div>
              <p className={styles.reviewText}>{eachReview.comment}</p>
              <span className={styles.reviewerName}>
                Posted by: {eachReview.customer?.username}
              </span>
            </div>
          ))
        )}
      </div>

      {/* if the logged in user is NOT the owner of the service, the review form component will load */}
      {!isOwner ? (
        <div className={styles.reviewFormContainer}>
          <ReviewForm serviceId={serviceId} onSubmitted={loadData} />
        </div>
      ) : null}
    </div>
  )
}

export default ServiceDetails
