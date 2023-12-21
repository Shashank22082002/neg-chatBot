import React, { useState, useEffect } from 'react';
import "./card.css"

const ClientCard = ({ phoneNumber, Discount, rangeval, slot }) => {
    const [conversation, setConversation] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [clientInfo, setClientInfo] = useState(null);

    const fetchClientInfo = async (phoneNumber) => {
        try {
            const response = await fetch(`http://localhost:3000/client-info/${phoneNumber}`);
            if (!response.ok) {
                throw new Error('Failed to fetch client info');
            }
            const clientInfoData = await response.json();
            setClientInfo(clientInfoData[0]);
            // console.log(clientInfoData)

        } catch (error) {
            console.error('An error occurred while fetching client info:', error);
        }
    };

    const formatDate = (lastVisited) => {
        const date = new Date(lastVisited);
        return date.toLocaleString(); // Adjust the format based on your preference
    };

    const findRange = (val) => {
        if (val <= 3) {
            // return a string val * 2 - 1, val * 2
            return `${val * 2 - 1} - ${val * 2}`;
        } else {
            return `6+`;
        }
    }

    const findSlot = (val) => {
        switch (val) {
            case 1:
                return "9:00 AM - 12:00 PM";
            case 2:
                return "12:00 PM - 3:00 PM";
            case 3:
                return "3:00 PM - 6:00 PM";
            case 4:
                return "6:00 PM - 9:00 PM";
            case 5:
                return "9:00 PM - 12:00 AM";
            default:
                return "Not Known";
        }
    }
    const loadConversation = async () => {
        try {
            const response = await fetch(`http://localhost:3000/conversation/${phoneNumber}`);
            if (!response.ok) {
                throw new Error('Failed to fetch conversation data');
            }
            const conversationData = await response.json();
            conversationData.sort((a, b) => new Date(a.SendTime) - new Date(b.SendTime));
            setConversation(conversationData);
        } catch (error) {
            console.error('An error occurred while fetching conversation:', error);
        }
    }
    const sendMessage = async (message) => {
        try {
            const response = await fetch(`http://localhost:3000/reply/${phoneNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            loadConversation();
            setNewMessage('');
        } catch (error) {
            console.error('An error occurred while sending message:', error);
            // Handle errors or display an error message to the user
        }
    };

    const confirmBooking = async () => {
        const discountPercentage = prompt('Enter discount percentage:');

        if (discountPercentage !== null) {
            // User clicked OK
            const booking = {
                PhoneNumber: phoneNumber,
                SlotNumber: slot,
                PeopleRange: rangeval,
                Discount: parseInt(discountPercentage) || 0, // Parse as float or set to 0 if invalid
            };
            console.log(booking);
            
            // Call your API to create a new booking
            try {
                const response = await fetch('http://localhost:3000/new-booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(booking),
                });

                if (!response.ok) {
                    throw new Error('Failed to create a new booking');
                }

                const data = await response.json();
                console.log('Booking created successfully:', data);
            } catch (error) {
                console.error('An error occurred while creating a new booking:', error);
            }
        }
    };

    useEffect(() => {
        // Load conversation data and fetch client information when the component mounts
        loadConversation();
        fetchClientInfo(phoneNumber);
    }, []);

    return (
        <div className="card-boundary">
            <div className="left-card">
                <div className="client-info">
                    <p>Phone Number: {phoneNumber}</p>
                    {clientInfo && (
                        <>
                            <p>Name: {clientInfo.Name}</p>
                            <p>Rating: {clientInfo.ReputationScore}</p>
                            <p>Visited Count: {clientInfo.VisitedCount}</p>
                        </>
                    )}
                    <p>Slot: {findSlot(slot)}</p>
                    <p>People: {findRange(rangeval)}</p>
                    <p>Discount-Demanded: {Discount}</p>
                </div>
                <div className='confirm-book'>
                    <span>Confirm Booking: </span>
                    <span className='confirm-box'><i onClick={confirmBooking} className='confirm-btn material-icons'>done</i></span>
                </div>
            </div>
            <div className='right-card'>
                <div className="chat-box">
                    {conversation.map((message) => (
                        <div key={message.SendTime} className={`message ${message.Sender === 1 ? 'message-left' : 'message-right'}`}>
                            <div className="message-content">{message.Message}</div>
                            <div className="message-time">{formatDate(message.SendTime)}</div>
                        </div>
                    ))}
                </div>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => sendMessage(newMessage)}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );

}

export default ClientCard;