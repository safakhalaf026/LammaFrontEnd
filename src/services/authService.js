import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth`

const signUp = async (formData) =>{
    // send post to backend
    const res = await axios.post(`${BASE_URL}/sign-up`, formData)

    // get data from form that is sent to backend
    const data = res.data

    // get token from the response
    const token = data.token

    // save token in browser
    localStorage.setItem('token', token)

    // extract user from token 
    const encodedPayload = token.split('.')[1]
    const decodedPayload = atob(encodedPayload)

    // convert decoded payload from json object to javascript
    const parsedPayload = JSON.parse(decodedPayload)
    const user = parsedPayload.payload
    return user
}

const signIn = async (formData) =>{
    // send post to backend
    const res = await axios.post(`${BASE_URL}/sign-in`, formData)

    // get data from form that is sent to backend
    const data = res.data

    // get token from the response
    const token = data.token

    // save token in browser
    localStorage.setItem('token', token)

    // extract user from token 
    const encodedPayload = token.split('.')[1]
    const decodedPayload = atob(encodedPayload)

    // convert decoded payload from json object to javascript
    const parsedPayload = JSON.parse(decodedPayload)
    const user = parsedPayload.payload
    return user
}

export{
    signUp,
    signIn
}