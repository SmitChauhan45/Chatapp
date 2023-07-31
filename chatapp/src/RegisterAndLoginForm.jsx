import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";


export const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const [islogin, setIslogin] = useState("Login");


  async function handleSubmit(ev) {
    // e.preventdefault();
    ev.preventDefault();
    // console.log("asdfdgsaesfdgsfasfd");
    //backend call
    const url = islogin === 'Register' ? "/register" : "/login"
    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username)
    setId(data.id)
  }

  
  return (
    //ui
    <div className="flex items-center h-screen bg-blue-50">
      <form className="w-64 mx-auto" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="username"
          className="block w-full p-2 mb-2 border rounded-sm"
        />
        <input
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="password"
          className="block w-full p-2 mb-2 border rounded-sm"
        />
        <button className="block w-full p-2 text-white bg-blue-500 rounded-sm">
          {islogin}
        </button>
        <div className="mt-2 text-center ">
          {islogin === 'Register' && (
            <div>
              Already existing user?
              <button onClick={() => { setIslogin("Login") }}>login here</button>
            </div>)}
          {islogin === 'Login' && (
            <div>
              new user?
              <button onClick={() => { setIslogin("Register") }}>Register here</button>
            </div>)}
        </div>
      </form>
    </div>
  );
};
