import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import './App.css';
import Call from './Call';
import Home from './Home';

function App() {
  const [userType, setUserType] = useState('viewer');
  const isOwner = userType === 'owner';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home setUserType={setUserType} />} />
        <Route path="/call/:callId" element={<Call isOwner={isOwner} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
