import React from 'react';

interface CheckoutButtonProps {
  eventId: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ eventId }) => {
  const handleClick = async () => {
    const formData = new FormData();
    formData.append('eventId', eventId);

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'X-Session-ID': localStorage.getItem('maly_session_id') || '',
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('Error creating event:', response.status);
      // Handle error appropriately, e.g., display an error message to the user
      return;
    }

    // Handle successful event creation
    console.log('Event created successfully!');
  };

  return (
    <button onClick={handleClick}>Checkout</button>
  );
};

export default CheckoutButton;