import React, { useState } from 'react';

const ReviewForm = ({ serviceId, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get JWT token from localStorage (after user signs in)
    const token = localStorage.getItem('token');

    const res = await fetch('/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        service: serviceId,
        rating: Number(rating),
        comment
      })
    });

    if (res.ok) {
      setRating(5);
      setComment('');
      if (onSubmitted) onSubmitted(); // reload reviews in ServiceDetails
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to submit review');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <div>
        <label>Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
      </div>
      <div>
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment"
        />
      </div>
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default ReviewForm;
