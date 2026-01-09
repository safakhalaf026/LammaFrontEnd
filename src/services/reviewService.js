import axios from "axios"

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/review`

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
})

// Submit a new review for a service
 const submitReview = async (serviceId, formData) => {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User is not authenticated")

  const payload = {
    service: serviceId,
    ...formData,
  }

  const res = await axios.post(`${BASE_URL}/${serviceId}`, payload, authConfig())
  return res.data
}

// Get all reviews for a specific service
  const getReviews = async (serviceId) => {
  const res = await axios.get(`${BASE_URL}/${serviceId}`, authConfig())
  return res.data.allReviews
}

export {
  submitReview,
  getReviews
}
