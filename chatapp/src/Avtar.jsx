import React from 'react'

export const Avtar = ({ userId, username,isOnline }) => {
    return (
        <div className='w-8 h-8 relative bg-red-200 rounded-full flex items-center justify-center capitalize'>
            {/* <div className='text-center'>{username[0]}</div> */}

            {username[0]}
            {isOnline&&
            <div className=' absolute w-3 h-3  bg-green-500 bottom-0  -right-0 border border-white rounded-full '></div>
            }
            {!isOnline&&
            <div className=' absolute w-3 h-3  bg-gray-500 bottom-0  -right-0 border border-white rounded-full '></div>
            }
        </div>
    )
}
