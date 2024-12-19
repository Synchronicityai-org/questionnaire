import React from 'react'
import book from '/books.png'
import {useStore} from './store'
function Header() {
    const {queryParam, setQueryParam} = useStore();
  return (
    <div className='flex flex-col flex-wrap content-center'>
      <div className='flex flex-wrap items-center justify-evenly w-1/2 h-fit mb-2'>
        <img src={book} alt="book gif" className='w-1/4 h-1/4 drop-shadow-lg'></img>
        <h1 className='text-7xl font-bold bg-gradient bg-clip-text text-transparent'>BOOKS</h1>
      </div>
    
      <input type='text' placeholder='Search for Books ...' name={queryParam} onChange={(e)=>setQueryParam(e.target.value)}className='w-1/2 h-fit mt-2 p-2 border-x-4 border-gray-500 bg-lightGray outline-none'></input>
      
    </div>
  )
}

export default Header
