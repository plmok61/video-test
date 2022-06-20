import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';


function Home({ setUserType }) {
  const navigate = useNavigate();
  return (
    <div>
    <button 
      onClick={() => {
        const id = uuidv4();
        setUserType('owner');
        navigate(`/call/${id}`);
      }}
    >
      Create Call
    </button>
  </div>
  )
}

export default Home;
