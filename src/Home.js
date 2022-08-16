import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';


function Home({ setUserType }) {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', margin: '20px auto', padding: '20px', width: '500px', border: "1px solid black" }}>
      <h1>Video Client Test</h1>
      <button
        style={{ padding: '20px' }}
        onClick={() => {
          const id = uuidv4();
          setUserType('owner');
          navigate(`/call/${id}`);
        }}
      >
        Create Call
      </button>
      <button
        style={{ padding: '20px', marginLeft: '20px' }}
        onClick={() => {
          const id = uuidv4();
          setUserType('viewer');
          navigate(`/call/${id}`);
        }}
      >
        Join Call
      </button>
    </div>
  )
}

export default Home;