import styles from './Landing.module.css'
import '../../app.css'
import { useNavigate } from 'react-router'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <main className={styles.main}>

      <div className={styles.features}>
        <p>Discover services nearby</p>
        <span className={styles.divider} />
        <p>Offer your skills</p>
        <span className={styles.divider} />
        <p>Build trust through reviews</p>
      </div>

      <h1 className={styles.title}>Welcome to Lamma</h1>
      <p className={styles.subtitle}> A simple way for neighbours to connect and offer local services.</p>

      <div className={styles.buttonDivs}>
        <button className={styles.primaryBtn} onClick={() => navigate('/sign-up')}> Create an account </button>
        <button className={styles.secondaryBtn} onClick={() => navigate('/sign-in')}>Sign In</button>
      </div>
    </main>
  )
}

export default Landing

