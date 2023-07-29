import React from 'react'
import { Avtar } from './Avtar'
export const Contact = ({userId,username,setSelectUserid,selectUserid,isOnline}) => {
  return (
    <div
                key={userId}
                onClick={() => setSelectUserid(userId)}
                className={
                  "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
                  (userId === selectUserid ? "bg-blue-100" : "")
                }
              >
                {userId === selectUserid && (
                  <div className="w-1 h-12 bg-blue-500 rounded-r-md "></div>
                )}

                <div className="flex items-center gap-2 py-2 pl-4 ">
                  <Avtar username={username} userId={userId} isOnline={isOnline} />
                  <span className="">{username}</span>
                </div>
              </div>
  )
}
