
import React, {useState, useEffect} from 'react';
import ClientCard from './Card';
import Navbar from './Navbar';


const NegRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    // Fetch pending negotiation requests when the component mounts
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('http://localhost:3000/forwarded-requests');
        if (!response.ok) {
          throw new Error('Failed to fetch pending requests');
        }

        const requestData = await response.json();
        setPendingRequests(requestData);
      } catch (error) {
        console.error('An error occurred while fetching pending requests:', error);
        // Handle errors or display an error message to the user
      }
    };

    fetchPendingRequests();
  }, []);

  return (
    <div>
      <Navbar />
      <div><h1>Negotiation Requests</h1></div>
      {
        pendingRequests.map((request, index) => (
          <ClientCard
            key={index}
            phoneNumber={request.PhoneNumber}
            Discount={request.DiscountVal}
            rangeval={request.PeopleRange}
            slot={request.SlotNumber}
          />
        ))
      }
    </div>
  );
};

export default NegRequests;
