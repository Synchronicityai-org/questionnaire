import React from 'react';
import '@components/header.css';
import { useStore } from '@components/store';
function Header() {
  const{input,handleChange,handleInput} = useStore();
  return (
    <header className='w-full h-[250px] bg-cover flex items-center justify-center flex-col'>
      <div className='w-[500px] h-fit'>
        <h1 className='text-4xl font-bold mb-2'>T O D O</h1>
        <input type='text' placeholder='Crete a new task' className='w-[400px] h-[40px]' value={input} onChange={handleChange} onBlur={handleInput} required></input>
      </div>
    </header>
  )
}
export default Header
