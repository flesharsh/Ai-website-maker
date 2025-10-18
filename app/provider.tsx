"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/UserDetailContext'
import { OnSaveContext } from '@/context/OnSaveContext'

const Provider = ({children}:Readonly<{children:React.ReactNode}>) => {

    const {user}=useUser();
    const [userDetail,setUserDetail]=useState<any>();
    const [onSaveData,setOnSaveData]=useState<any>(null);
    useEffect(()=>{
        user&&createNewUser();
    },[user])
    const createNewUser=async()=>{
      try {
        const result=await axios.post('/api/users',{})
        // console.log(result.data);
        setUserDetail(result.data?.user)
      } catch (error) {
        console.error("clerk error:",error);
      }
    }


  return (
    <div>
      <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
        <OnSaveContext.Provider value={{onSaveData,setOnSaveData}}>
        {children}
        </OnSaveContext.Provider>
      </UserDetailContext.Provider>
    </div>
  )
}

export default Provider;