import { Link } from 'react-router'
import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import styles from './NavBar.module.css'
import '../../app.css'
import LammaLogo from '../../images/LammaLogo.png'

const NavBar = () => {
  const {user, setUser} = useContext(UserContext)

  const handleSignOut = ()=>{
    localStorage.removeItem('token')
    setUser(null)
  }
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <img src= {LammaLogo} alt='lamma logo' />
        <h1>Lamma</h1>
      </div>

      {user ? (
        <ul>
          <li><Link to='/'>Dashboard</Link></li>
          <li><Link onClick={handleSignOut} to='/'>Sign Out</Link></li>
        </ul>) :
        <ul>
          <li><Link to='/'>Home</Link></li> 
          <li><Link to='/sign-up'>Sign Up</Link></li>
          <li><Link to='/sign-in'>Sign In</Link></li>
        </ul>
      }
    </nav>
  );
};

export default NavBar;

