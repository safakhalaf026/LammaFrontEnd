import React from 'react'
import defaultAvatar from '../../images/af.png'
import { Link } from "react-router";
import axios from "axios";


function ServiceCard({service}) {
   
   function handleRequest() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACK_END_SERVER_URL}/service/${service._id}/request`,
        {
          Latitude: pos.coords.latitude,
          Longitude: pos.coords.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Service requested successfully");
    } catch (error) {
      console.log(error);
    }
  });
}
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
    </div>

    <div className="card-footer">

        <Link to={`/service/${service._id}`} >Service Details</Link>
      </div>


    </div>
  )}

export default ServiceCard
