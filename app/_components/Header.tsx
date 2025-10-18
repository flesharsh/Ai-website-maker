import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const MenuOptions=[
    {
        name:'Pricing',
        path:'/pricing'
    },
    {
        name:'Contact Us',
        path:'/Contact-us'
    }
]

const Header = () => {
  return (
    <div className='flex items-center justify-between p-4 shadow'>
        {/* logo */}
        <div className='flex gap-2 items-center'>
            <Image src={'/logo.svg'} alt='logo' width={35} height={35}/>
            <h2 className='font-bold text-xl'>AI WEBSITE MAKER</h2>
        </div>
        {/* menu items */}
        <div className='flex gap-3'>
            {MenuOptions.map((menu,index)=>(
                <Button variant={'ghost'} key={index}>{menu.name}</Button>
            ))}
        </div>
        {/* get started button */}
            <div>
                <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
                <Link href={'/workspace'}>
                <Button>Get Started <ArrowRight/></Button>
                </Link>
                </SignInButton>
            </div>
    </div>
  )
}

export default Header