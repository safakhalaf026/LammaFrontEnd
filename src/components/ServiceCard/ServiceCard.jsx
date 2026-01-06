import React from 'react'
import defaultAvatar from '../../images/af.png'
import { Link } from "react-router";

function ServiceCard({service}) {
   
    function  handleRequest(){
  
     window.navigator.geolocation.getCurrentPosition( async function success(pos) {
       const crd = pos.coords;
            console.log("Your current position is:");
            console.log(`Latitude : ${crd.latitude}`);
            console.log(`Longitude: ${crd.longitude}`);
            console.log(`More or less ${crd.accuracy} meters.`);
         try {
            { await axios.post(`${VITE_BACK_END_SERVER_URL}/service/${service._id}/request`,
            { Latitude: crd.latitude,Longitude: crd.longitude },
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
          )
        }
        return (response.data);
         } catch (error) {
            console.log(error)
         }
        


    })
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
         {/*  اشاره الاستفهام تعني لوو كان في تقييم والا فاستمر */}
         {/* بيطلع التقيم⭐ 4.5(12) */}
         {/*  */}
         <span>⭐ {service.ratingStats?.average || 0} ({service.ratingStats?.count || 0})</span>
             <p>{service.category}</p>
             <p>{service.pricing}</p>
             <p>{service.pricing==='Fixed'?'price:' +service.amount:""}</p>

            </div>

        <p className="description">{service.description}</p>

    </div>

    <div className="card-footer">

        <Link to={`/service/${service._id}/details`} >Service Details</Link>
        <button onClick={handleRequest}>Request Service</button>
      </div>


    </div>
  )
}
}
export default ServiceCard
