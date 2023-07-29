import { createContext, useEffect, useState } from "react"
import axios from "axios"
export const UserContext = createContext({})

export function UserContextProvider({ children }) {
    const [username, setUsername] = useState(null)
    const [id, setId] = useState(null)
    useEffect(() => {
        axios.get('/profile').then(result => {
            setId(result.data.userId);
            setUsername(result.data.username);

        }).catch((err) => {
            console.log(err)
        });
    }, [])
    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }} >
            {children}
        </UserContext.Provider>
    )
}
// export default UserContextProvider
// export default UserContext