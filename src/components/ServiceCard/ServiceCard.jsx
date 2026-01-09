import defaultAvatar from '../../images/af.png'
import { Link } from "react-router";
import styles from "./ServiceCard.module.css"

function ServiceCard({service, isActive}) {
   
  
  return (

    <div className={`${styles['service-card']} ${isActive ? styles.active : ''}`}>
          {/* add active class when chose service*/}


      <div id={styles['card-header']}> 
        <img 
            src={service.provider.avatar? service.provider.avatar : defaultAvatar } 
            alt={service.provider.username} 
            className={styles.avatar}
        />
        <p>{service.provider.displayName} </p>
    </div>

    <div id={styles['card-details']}>
        <h3>{service.serviceName}</h3>

            <div className={styles['service-rating']}>
         {/*  علامة الاستفهام تعني: إذا وُجد تقييم اعرضه، وإلا اعرض 0*/}
         {/* بيطلع التقيم⭐ 4.5(12) */}
        
         <span>⭐ {service.ratingStats?.average || 0} ({service.ratingStats?.count || 0})</span>
             <p>{service.category}</p>
             <p>{service.pricing}</p>
             <p>{service.pricing==='Fixed'?'price:' +service.amount:""}</p>

            </div>
    </div>

    <div className={styles['card-footer']}>

        <Link to={`/service/${service._id}`} >Service Details</Link>
      </div>


    </div>
  )}

export default ServiceCard
