import React from 'react'
import headImage from '/images/bg-header-desktop.svg';
import { useStore } from './store';
import { useEffect } from 'react';
function App() {
  const {jobs, fetchJobs} = useStore();
  useEffect(()=>{
    fetchJobs();
  },[])
  return (
    <div className='bg-background min-h-screen'>
      <header>
        <img src={headImage} alt="heading banner" className='w-fill h-fit'></img>
      </header>
      <div>
        {jobs.map((job)=>{
          <img src={job.logo} alt={job.company}></img>
        })}
      </div>
    </div>
  )
}

export default App
