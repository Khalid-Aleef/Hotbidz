import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showSplash, setShowSplash] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/login', form);
      alert(res.data.message);
      localStorage.setItem('userId', res.data.userId);
      setShowSplash(true);
      
      const audio = new Audio(process.env.PUBLIC_URL + '/car.mp3');
      audio.play();
      setTimeout(() => {
        setShowSplash(false);
        navigate(`/userinventory/${res.data.userId}`);
      }, 1000); 
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      {showSplash ? (
       
          <img src={process.env.PUBLIC_URL + "/splashscreen.jpg"} alt="Success" className="splash-img" />
        
      ) : (
        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
