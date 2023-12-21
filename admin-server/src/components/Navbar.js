import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import "./navbar.css";

const Navbar = () => {
    const navigate = useNavigate()
    const showClientDetails = () => {
        console.log("Client Details");
        navigate('/dashboard/clients');
    }

    const handleDiscountRules = () => {
        console.log("Discount Rules");
        navigate('/dashboard/discount-rules')
    }

    const handleNegotiationRequests = () => {
        console.log("Negotiation Requests");
        navigate('/dashboard/negotiation-requests')
    }

    const handleBookings = () => {
        console.log("Bookings");
        navigate('/dashboard/bookings')
    }

    const handleDashboard = () => {
        console.log("Dashboard");
        navigate('/dashboard')
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuOpen = () => {
        setIsMenuOpen(!isMenuOpen);
        console.log(isMenuOpen)
        if (isMenuOpen) {
            // add open class to navbar-menu and navbar
            document.querySelector(".navbar-menu").classList.add("open");
            document.querySelector(".navbar").classList.add("open");
        } else {
            // remove open class to navbar-menu and navbar
            document.querySelector(".navbar-menu").classList.remove("open");
            document.querySelector(".navbar").classList.remove("open");
        }
    }

    return (
        <nav className='navbar'>
            <div className='navbar-overlay' onClick={toggleMenuOpen}></div>
            <button type='button' className='navbar-burger' onClick={toggleMenuOpen}>
                <span className='material-icons'>menu</span>
            </button>
            <button type='button' className='active' onClick={handleDashboard}>
                <h1 className="navbar-title">Dashboard</h1>
            </button>
            <nav className='navbar-menu'>
                <button type="button" className="active" onClick={showClientDetails}>Clients</button>
                <button type="button" className="active" onClick={handleNegotiationRequests}>Negotiation Requests</button>
                <button type="button" className="active" onClick={handleDiscountRules}>Discount Rules</button>
                <button type='button' className='active' onClick={handleBookings}>Bookings</button>
            </nav>
        </nav>
    );
};

export default Navbar;