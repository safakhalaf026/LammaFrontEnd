import defaultAvatar from '../../images/af.png'
import { Link } from "react-router";


function ServiceCard({service}) {

  return (
    <div>
      <div id='card-header'> 
        <img 
            src={service.provider.avatar ||defaultAvatar } 
            alt={service.provider.username} 
            className="avatar" 
        />
        <p>{service.provider.displayName} </p>
    </div>

    <div id='card-details'>
        <h3>{service.serviceName}</h3>

            <div className="service-rating">
         <span>⭐ {service.ratingStats?.average || 0} ({service.ratingStats?.count || 0})</span>
             <p>{service.category}</p>
             <p>{service.pricing}</p>
             <p>{service.pricing==='Fixed'?'price:' +service.amount:""}</p>

            </div>
    </div>

    <div className="card-footer">

        <Link to={`/service/${service._id}`} >Service Details</Link>
      </div>


    </div>
  )}

export default ServiceCard
