import React from 'react';
import { useState} from 'react';
import bgImage from '@assets/bg-desktop-dark.jpg';
function Header({getData}) {
    const [input, setInput] = useState('');
    const handleChange = (e) => {
        const inputValue = e.target.value;
        setInput(inputValue);
    }
    const handleInput = ()=>{
        getData(input);
        setInput('');
    }
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
