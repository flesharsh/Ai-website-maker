import { PricingTable } from '@clerk/nextjs'
import React from 'react'

const Pricing = () => {
  return (
    <div className='flex items-center flex-col justify-center w-full h-[70%]'>
      <h2 className='font=bold text-3xl my-5'>Pricing</h2>
      <div className='flex w-[800px]'>
        <PricingTable/>
      </div>
    </div>
  )
}

export default Pricing