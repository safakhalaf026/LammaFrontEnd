import React, { useState } from 'react'
import { submitReview } from '../../services/reviewService'
import styles from './ReviewForm.module.css' 


const ReviewForm = ({ serviceId, onSubmitted }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5.')
      return
    }

    if (!comment.trim()) {
      alert('Comment cannot be empty.')
      return
    }

    try {
      setLoading(true)
      await submitReview(serviceId, { rating: Number(rating), comment })

      // Reset form after successful submission
      setRating(5)
      setComment('')
      if (onSubmitted) onSubmitted() // Refresh reviews if callback is provided
    } catch (error) {
      const message =
        error.response?.data?.err || error.response?.data?.error || 'Error submitting review.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.ratingBox}>
        <label className={styles.label}>Rating</label>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
              onClick={() => setRating(star)}
              role="button"
              aria-label={`${star} star`}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setRating(star)
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className={styles.label}>Comment</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
          disabled={loading}
        />
      </div>
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}


export default ReviewForm
