import { useState } from 'react'
import { submitReview } from '../../services/reviewService'
import styles from './ReviewForm.module.css'
import '../../app.css'

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
    <main className= {styles.wrapper}>
      <h4 className={styles.title}>Leave a Review</h4>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}> 
          <label htmlFor="rating">Rating</label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </main>

  )
}

export default ReviewForm
