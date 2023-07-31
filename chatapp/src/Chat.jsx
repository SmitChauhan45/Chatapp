import React, { useContext, useEffect, useRef, useState } from "react";
import { Avtar } from "./Avtar";
import { Logo } from "./Logo";
import { UserContext } from "./UserContext";
import { lodash, uniqBy } from "lodash";
import axios from "axios";
import {Contact} from "./Contact"
// import { connect } from "mongoose";

export const Chat = () => {

  const [ws, setWs] = useState(null);
  const [onlinepeople, setOnlinepeople] = useState({});
  const [selectUserid, setSelectUserid] = useState(null);

  const { id, username,setId,setUsername } = useContext(UserContext);
  const [textmsg, setTextmsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [offlinepeople, setOfflinepeople] = useState({});
  

  const divUnderMsg = useRef();


  function showOnlineppl(peopleArray) {
    const people = {};
    // console.log(peopleArray);
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinepeople(people);
  }

  function handleMsg(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlineppl(messageData.online);
    } else {
    
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }
  const messageWithoutDupes = uniqBy(messages, "_id");
  //send msg
  function sendMsg(ev,file = null) {
    if (ev)
      ev.preventDefault();
    ws.send(
      JSON.stringify({
        message: {
          recipient: selectUserid,
          text: textmsg,
          file,
        },
      })
    );
    setTextmsg("");
    setMessages((prev) => [
      ...prev,
      { text: textmsg, sender: id, recipient: selectUserid,_id:Date.now() },
    ]);
    if (file) {
      axios.get('/messages/' + selectUserid).then(res => {
        setMessages(res.data);
      })
    }
      
  }

  //file 
  function uploadFile(ev){
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMsg(null, {
        name: ev.target.files[0].name,
        data: reader.result
      });
    }
  }

  useEffect(() => {
    connectToWS()
  }, []);
  function connectToWS()
  {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMsg);
    ws.addEventListener("close",()=>connectToWS())
  }

    //for auto scrolling of msg
    useEffect(() => {
        const div = divUnderMsg.current;
        if(div)
          div.scrollIntoView({ behavior: 'smooth' });
    }, [messages])
    // to fetch old chat
  
    useEffect(() => {
        if (selectUserid)
          axios.get('/messages/' + selectUserid).then(res => {
            setMessages(res.data)
            })
        // console.log(first)
        
    }, [selectUserid])
  useEffect(() => {
    const getuser = async() => {
      const  {data}  = await axios.get('/people');
      const offpeople = data.filter(p => (p._id !== id)).filter(p => onlinepeople[p._id] == null)
      const offpplobj = {}; 
      offpeople.forEach(ppl => {
        offpplobj[ppl._id] = ppl.username
      })
      setOfflinepeople(offpplobj);
    }
    getuser();
  }, [onlinepeople])
  
  function logout(ev) {
    axios.post('/logout').then(() => {
      // ws.close();
      setWs(null);
      setId(null);
      setUsername(null);
    })
  }

  return (
    //chat ui

    <div className="flex h-screen">
      <div className="relative w-1/3 bg-white">
        <div>
        <Logo />
        <span>WelCome {username}</span>

        {/* avtar + online */}
        {Object.keys(onlinepeople).map((userId) => {
          if (id !== userId) {
            return (
              <Contact key={userId} userId={userId} username={onlinepeople[userId]} setSelectUserid={setSelectUserid} selectUserid={selectUserid} isOnline={true}></Contact>
            );
          }
        })}
        {Object.keys(offlinepeople).map((userId) => {
          if (id !== userId) {
            return (
              <Contact key={userId} userId={userId} username={offlinepeople[userId]} setSelectUserid={setSelectUserid} selectUserid={selectUserid} isOnline={false}></Contact>
            );
          }
        })}
      </div>
        <div className="absolute bottom-0 flex justify-center w-full p-2 mx-auto ">
          <button onClick={logout} className="p-2 text-black transition-all bg-blue-100 border rounded-sm shadow-sm hover:bg-black hover:text-white " >Logout</button>
        </div>
      </div>
      {/* //chatbarrr */}
      <div className="flex flex-col w-2/3 p-2 bg-blue-200 ">
        <div className="flex-grow">
          {!selectUserid && (
            <div className="flex items-center justify-center flex-grow h-full">
              <div className="text-gray-400 ">
                {" "}
                &larr; Select A Person from Sidebar
              </div>
            </div>
          )}
        </div>

        {/* message show  */}
        {!!selectUserid && (
          <div  className="h-full overflow-y-scroll ">
            {messageWithoutDupes.map((message, index) => (
              <div className={(message.sender === id? 'text-right ':'text-left ')}>
                <div
                  key={index}
                  className={
                    "p-2 my-2 inline-block rounded-sm text-sm  " +
                    (message.sender === id
                      ? " bg-blue-500 text-white "
                      : " bg-white text-black ")
                  }
                >
                  {message.sender === id
                    ? "ME: "
                    : onlinepeople[selectUserid] + ": "}
                  {message.text}
                  {
                    message.file && (
                      <div>
                        <a className="bg-blue-100 " target="_blank" href={axios.defaults.baseURL +'/uploads/'+ message.file}>{message.file}</a>
                      </div>
                    )
                  }
                  
                </div>
              </div>
            ))}
            <div ref={divUnderMsg}></div>          
            
          </div>
        )}

        {/* message place */}
        {!!selectUserid && (
          <form className="flex gap-2" onSubmit={sendMsg}>
            <input
              value={textmsg}
              onChange={(ev) => setTextmsg(ev.target.value)}
              type="text"
              placeholder="Type Your Message "
              className="flex-grow p-2 bg-white border rounded-sm"
            />
            <label type="button" className="p-2 text-black bg-gray-200 border border-gray-200 rounded-sm cursor-pointer">
              <input type="file" className="hidden " onChange={uploadFile}></input>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
</svg>

            </label>

            <button
              type="submit"
              className="p-2 text-white bg-blue-500 rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
