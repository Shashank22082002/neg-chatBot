import React, { useState, useEffect } from 'react';
import './table.css';
import Navbar from './Navbar';

const Clients = () => {
  const [clientData, setClientData] = useState([]);
  const formatDate = (lastVisited) => {
    const date = new Date(lastVisited);
    return date.toLocaleString(); // Adjust the format based on your preference
  };
  useEffect(() => {
    // Fetch client data from the API
    fetch('http://localhost:3000/client-info')
      .then((response) => response.json())
      .then((data) => setClientData(data))
      .catch((error) => console.error('Error fetching client data:', error));
  }, []); // Empty dependency array to fetch data once on component mount

  return (
    <div>
      <Navbar />
      <table>
        <caption>Clients Info</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Phone-Number</th>
            <th scope="col">Visited Count</th>
            <th scope="col">Rating</th>
            <th scope="col">Last Visited</th>
          </tr>
        </thead>
        <tbody>
          {clientData.map((client) => (
            <tr key={client.PhoneNumber}>
              <td data-label="Name">{client.Name}</td>
              <td data-label="Phone-Number">{client.PhoneNumber}</td>
              <td data-label="Visited Count">{client.VisitedCount}</td>
              <td data-label="Rating">{client.ReputationScore}</td>
              <td data-label="Last Visited">{formatDate(client.LastVisited)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clients;
