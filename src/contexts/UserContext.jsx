import { createContext, useState } from 'react'

const UserContext = createContext()

const getUserFromToken = ()=>{
    const token = localStorage.getItem('token') // retrieve JWT from browser
    if (!token) return null // when no token is in local storage

    // extract user from token
    const encodedPayload = token.split('.')[1]
    const decodedPayload = atob(encodedPayload)

    // convert decoded payload from json object to javascript
    const parsedPayload = JSON.parse(decodedPayload)
    const user = parsedPayload.payload
    return user
}

function UserProvider({ children }) {
    const [user, setUser] = useState(getUserFromToken())
    const value= {
        user, setUser
    }
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export { UserProvider,UserContext }