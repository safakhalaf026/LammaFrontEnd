import styles from './Landing.module.css'
import '../../app.css'
import { useNavigate } from 'react-router';

const Landing = () => {
  const navigate = useNavigate()
  return (
    <main className={styles.main}>
      <h1>Welcome to Lamma !</h1>
      <p>The social app that connects neighbours with each other to provide services </p>
      <p>To Start </p>
      <div className={styles.buttonDivs}>
        <button className={styles.button} onClick={() => navigate('/sign-up')}> Sign Up</button>
        <button className={styles.button} onClick={() => navigate('/sign-in')}> Sign In</button>
      </div>
    </main>
  );
};

export default Landing;

