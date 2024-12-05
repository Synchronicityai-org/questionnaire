import React from 'react';
import { useStore } from '@components/store';
import bgImage from '@assets/bg-desktop-dark.jpg';
function Header() {
  const{input,handleChange,handleInput} = useStore();
  return (
    <header className="w-full h-[250px] bg-cover flex items-center justify-center flex-col"style={{ backgroundImage: `url(${bgImage})` }}>
      <div className='w-[500px] h-fit'>
        <h1 className='text-4xl font-bold mb-2 text-very-light-gray'>T O D O</h1>
        <input type='text' placeholder='Crete a new task' className='w-[400px] h-[40px] border-0 bg-very-dark-desaturated-blue text-light-grayish-blue' value={input} onChange={handleChange} onBlur={handleInput} required></input>
      </div>
    </header>
  )
}
export default Header
