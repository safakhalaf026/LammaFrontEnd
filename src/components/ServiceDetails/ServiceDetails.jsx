import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from './ReviewForm';

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);

  const loadData = async () => {
    const sRes = await fetch(`/services/${id}`);
    const sJson = await sRes.json();
    setService(sJson.service);

    const rRes = await fetch(`/reviews/${id}`);
    const rJson = await rRes.json();
    setReviews(rJson.reviews || []);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!service) return <p>Loading...</p>;

  return (
    <div>
      <h2>{service.serviceName}</h2>
      <p>{service.description}</p>
      <p>Average Rating: {service.ratingStats?.average || 0}</p>
      <p>Total Reviews: {service.ratingStats?.count || 0}</p>

      <h3>Reviews</h3>
      {reviews.map(r => (
        <div key={r._id}>
          <p>Rating: {r.rating}</p>
          <p>Comment: {r.comment}</p>
          <p>By: {r.customer?.displayName}</p>
        </div>
      ))}

      <ReviewForm serviceId={id} onSubmitted={loadData} />
    </div>
  );
};

export default ServiceDetails;
