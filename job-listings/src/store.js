import {create} from 'zustand';

const store = (set,get) => ({
jobs: [],
setJobs: (data) => set(jobs= {data}),
fetchJobs: ()=>{
    try{
        const response= fetch('/data.json');
        if(!response.ok){
            console.log('Error fetching the data')
        }
        const data = response.json();
        if(data){
            get().setJobs(data)
        }
    }
    catch(error){
        console.error('Error:', error)
    }
}
})

export const useStore = create(store);