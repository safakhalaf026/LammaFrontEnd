// Safa Khalaf
import { useState,useContext } from 'react';
import { useNavigate } from 'react-router';
import * as authService from '../../services/authService'
import { UserContext } from '../../contexts/UserContext';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConf: '',
    displayName: '',
    role: 'Customer',
    email: '',
    phone: '',
    avatar: '',
  });
  const {setUser} = useContext(UserContext)
  const { username, password, passwordConf, displayName, role, email, phone, avatar } = formData;

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const dataToSend = {...formData, phone:Number(formData.phone)}
    const user = await authService.signUp(dataToSend)
    setUser(user); 
    navigate('/')
  };

  const isFormInvalid = () => {
    return !(username && password && password === passwordConf);
  };

  return (
    <main>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='username'>Username:</label>
          <input
            type='text'
            id='username'
            value={username}
            name='username'
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor='password'>Password:</label>
          <input
            type='password'
            id='password'
            value={password}
            name='password'
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor='confirm'>Confirm Password:</label>
          <input
            type='password'
            id='confirm'
            value={passwordConf}
            name='passwordConf'
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor='displayName'>Display Name:</label>
          <input
            type='text'
            id='displayName'
            value={displayName}
            name='displayName'
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor='role'>Role:</label>
          <select
            id='role'
            value={role}
            name='role'
            onChange={handleChange}
            required >
            <option value="Customer">Customer</option>
            <option value="Service Provider">Service Provider</option>
          </select>
        </div>
        <div>
          <label htmlFor='email'>Email:</label>
          <input
            type='text'
            id='email'
            value={email}
            name='email'
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor='phone'>Phone Number:</label>
          <input
            type='text'
            id='phone'
            value={phone}
            name='phone'
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor='avatar'>Avatar:</label>
          <input
            type='text'
            id='avatar'
            value={avatar}
            name='avatar'
            onChange={handleChange}
          />
        </div>
        <div>
          <button disabled={isFormInvalid()}>Sign Up</button>
          <button onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </main>
  );
};

export default SignUpForm;
