// Safa Khalaf
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/service`

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
})

// retrieve all services
const index = async ()=>{
    try {
        const response = await axios.get(BASE_URL,authConfig())
        return response.data.services
    } catch (err) {
        console.log(err)
    }
}

// retrieve ONE service
const show = async (serviceId)=>{
    try {
        const response = await axios.get(`${BASE_URL}/${serviceId}`,authConfig())
        return response.data.service
    } catch (error) {
        console.log(error)
    }
}

// create new service
const create = async (formData)=>{
    try {
        const response = await axios.post(BASE_URL,formData, authConfig())

        return response.data.service
    } catch (error) {
        console.log(error)
    }
}

// edit service
const update = async (petId, formData)=>{
    try {
        const response = await axios.put(`${BASE_URL}/${petId}`,formData,authConfig())
        
        return response.data.service
    } catch (error) {
        console.log(error)
    }
}

// delete service
const remove = async (petId)=>{
    try {
        const response = await axios.delete(`${BASE_URL}/${petId}`,authConfig())
        
        return response.data.service
    } catch (error) {
        console.log(error)
    }
}
export {
    index,
    show,
    create,
    update,
    remove
}