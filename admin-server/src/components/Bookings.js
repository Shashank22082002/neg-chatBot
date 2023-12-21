import React, { useState, useEffect } from 'react';
import './table.css';
import Navbar from './Navbar';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        // Fetch bookings from the API
        fetch('http://localhost:3000/bookings')
            .then((response) => response.json())
            .then((data) => setBookings(data))
            .catch((error) => console.error('Error fetching bookings:', error));
    }, []); // Empty dependency array to fetch data once on component mount


    return (
        <div>
            <Navbar />
            <table>
                <caption>Bookings</caption>
                <thead>
                    <tr>
                        <th scope="col">BookingID</th>
                        <th scope="col">PhoneNumber</th>
                        <th scope="col">Slot Number</th>
                        <th scope="col">People Range</th>
                        <th scope="col">Discount Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking, index) => (
                        <tr key={index}>
                            <td data-label="BookingId">{booking.BookingID}</td>
                            <td data-label="PhoneNumber">{booking.PhoneNumber}</td>
                            <td data-label="Slot Number">{booking.SlotNumber}</td>
                            <td data-label="People Range">{booking.PeopleRange}</td>
                            <td data-label="Discount Percentage">{booking.Discount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Bookings;