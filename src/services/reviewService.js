import axios from "axios"

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/review`

// Submit a new review for a service
const submitReview = async (serviceId, formData) => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('User is not authenticated')

  const res = await axios.post(
    `${BASE_URL}/${serviceId}`,
    formData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  )

  return res.data // contains { review, ratingStats }
}

// Get all reviews for a specific service
const getReviews = async (serviceId) => {
  const res = await axios.get(`${BASE_URL}/${serviceId}`)
  return res.data.allReviews
}

export {
  submitReview,
  getReviews
}
