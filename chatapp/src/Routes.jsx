import React, { useContext } from 'react'
import { RegisterAndLoginForm } from './RegisterAndLoginForm'
import { UserContext } from './UserContext'
import { Chat } from './Chat'

export const Routes = () => {
    const { username, id } = useContext(UserContext)
    if (username) {
        return <Chat />
    }
    return (
        <RegisterAndLoginForm />
    )
}
