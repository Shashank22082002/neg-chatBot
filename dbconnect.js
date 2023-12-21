import mysql from 'mysql'
import generateUniqueId from 'generate-unique-id';

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password"
});


const databaseName = 'RestaurantDB'
const startConnection = (connection) => {
    connection.connect((error) => {
        if (error) {
            console.log('Error connecting to the MySQL Database');
            return;
        }
        console.log('Connection established sucessfully');
    });
}


// function to add a new client, attributes from db.sql
const addClient = (phone_number, name) => {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO RestaurantDB.Client (PhoneNumber, Name, LastVisited) VALUES (?, ?, NOW())', [phone_number, name], (error, results) => {
            if (error) {
                console.error('Error adding new client:', error);
                reject(error);
            } else {
                console.log('New client added', results);
                resolve(results);
            }
        });
    });
}

const updateClientState = (phone_number, client_state) => {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE RestaurantDB.Client SET State = ?, LastVisited = NOW() WHERE PhoneNumber = ?', [client_state, phone_number], (error, results) => {
            if (error) {
                console.error('Error updating client state:', error);
                reject(error);
            } else {
                console.log('Client state updated', results);
                resolve(results);
            }
            // console.log('Client updated', results);
        });
    });
}

const addNegLog = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO RestaurantDB.NegotiationLog (PhoneNumber, NegotiatingState) VALUES (?, 'NOPE')`, [phone_number], (error, results) => {
            if (error) {
                console.error('Error adding new negotiation log:', error);
                reject(error);
            } else {
                console.log('New negotiation log added', results);
                resolve(results);
            }
        });
    });
}


const storeTimeSlot = (phone_number, slot_number) => {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE RestaurantDB.NegotiationLog SET SlotNumber = ?, NegotiatingState = "SLOT_KNOWN" WHERE PhoneNumber = ?', [slot_number, phone_number], (error, results) => {
            if (error) {
                console.error('Error storing time slot:', error);
                reject(error);
            } else {
                console.log('Time slot stored', results);
                resolve(results);
            }
        }); 
    });
};


const storePeopleRange = (phone_number, people_range) => {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE RestaurantDB.NegotiationLog SET PeopleRange = ?, NegotiatingState = "BOOKING_SIZE_KNOWN" WHERE PhoneNumber = ?', [people_range, phone_number], (error, results) => {
            if (error) {
                console.error('Error storing people range:', error);
                reject(error);
            } else {
                console.log('People range stored', results);
                resolve(results);
            }
        });
    })
};

const storeDiscount = (phone_number, discount) => {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE RestaurantDB.NegotiationLog SET DiscountVal = ?, NegotiatingState = "DISCOUNT_KNOWN" WHERE PhoneNumber = ?', [discount, phone_number], (error, results) => {
            if (error) {
                console.error('Error storing discount:', error);
                reject(error);
            } else {
                console.log('Discount stored', results);
                resolve(results);
            }
        });
    })
};

const updateLogState = (phone_number, state) => {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE RestaurantDB.NegotiationLog SET NegotiatingState = ? WHERE PhoneNumber = ?', [state, phone_number], (error, results) => {
            if (error) {
                console.error('Error updating log state:', error);
                reject(error);
            } else {
                console.log('Log state updated', results);
                resolve(results);
            }
        });
    })
}


const getNegLogDetails = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM RestaurantDB.NegotiationLog WHERE PhoneNumber = ?', [phone_number], (error, results) => {
            if (error) {
                console.error('Error retrieving negotiation log:', error);
                reject(error);
            } else {
                console.log('Negotiation log retrieved', results);
                resolve(results);
            }
        });
    });
};


const createNewBooking = (phone_number, slot_number, people_range, discount) => {
    const booking_id = generateUniqueId({
        length: 10,
        useLetters: false
    });
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO RestaurantDB.Bookings (BookingID, PhoneNumber, SlotNumber, PeopleRange, Discount, TimeOfBooking) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`, [booking_id, phone_number, slot_number, people_range, discount], (error, results) => {
            if (error) {
                console.error('Error creating new booking:', error);
                reject(error);
            } else {
                console.log('New booking created', results);
                resolve(results);
            }
        }
        )
    });
}

const getBookings = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM RestaurantDB.Bookings', (error, results) => {
            if (error) {
                console.error('Error retrieving bookings:', error);
                reject(error);
            } else {
                console.log('Bookings retrieved', results);
                resolve(results);
            }
        });
    });
};

const getClientDetails = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM RestaurantDB.Client WHERE PhoneNumber = ?', [phone_number], (error, results) => {
            if (error) {
                console.error('Error retrieving client details:', error);
                reject(error);
            } else {
                console.log('Client details retrieved', results);
                resolve(results);
            }
        });
    });
};

// -----------------------------------------FIND OFFERS----------------------------------------------- //

// const getDefaultOffer = () => {
//     return "Get 10% off on your next order!";
// }

// const getOffersBasedOnPreviousBookings = (phone_number) => {
//     // write query to get previous bookings
//     // write query to get offers based on previous bookings
//     return "Get 20% off on your next order!";
// }

// const fetchOfferFromTable = (slotNumber, peopleRange, negState) => {
//     // if negState is RANGE_KNOWN, give offer from Offer1 column
//     // if negState is OFFER1_GIVEN, give offer from Offer2 column
//     // if negState is OFFER2_GIVEN, give offer from Offer3 column
//     const column = negState === 'RANGE_KNOWN' ? 'Offer1' : negState === 'OFFER1_GIVEN' ? 'Offer2' : 'Offer3';
//     console.log('column here', column);
//     return new Promise((resolve, reject) => {
//         connection.query('SELECT * FROM RestaurantDB.Offers WHERE slotNumber = ? AND peopleRange = ?', [slotNumber, peopleRange], (error, results) => {
//             if (error) {
//                 console.error('Error retrieving offer:', error);
//                 reject(error);
//             } else {
//                 console.log('Offer retrieved', results);
//                 resolve(results);
//             }
//         });
//     });
// }

// const getOffers = async (phNum) => {
//     // get values from NegLogTable
//     // if no value found, return default offer
//     const values = await getNegLogDetails(phNum);
//     if (values.length > 0) {
//         const slotNumber = values[0].SlotNumber;
//         const peopleRange = values[0].PeopleRange;
//         console.log('values here', values);
//         if (slotNumber !== null && peopleRange !== null) {
//             return await fetchOfferFromTable(slotNumber, peopleRange, values[0].NegotiatingState);
//         }
//     }
//     return null;
// }

// const insertOffers = (slot_number, people_range, offer1, offer2, offer3) => {
//     connection.query(`INSERT INTO RestaurantDB.Offers (SlotNumber, PeopleRange, Offer1, Offer2, Offer3)
//     VALUES (?, ?, ?, ?, ?)`, [slot_number, people_range, offer1, offer2, offer3], (error, results) => {
//         if (error) throw error;
//         console.log('Offers inserted', results);
//     });
// }

const getMaxPermissibleDiscount = (day, slot_number, people_range) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT Discount FROM RestaurantDB.DiscountRules WHERE Day = ? AND SlotNumber = ? AND PeopleRange = ?`, [day, slot_number, people_range], (error, results) => {
            if (error) {
                console.error('Error retrieving discount:', error);
                reject(error);
            } else {
                console.log('Discount retrieved', results);
                resolve(results);
            }
        })
    });
}

const getForwardedRequests = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM RestaurantDB.NegotiationLog WHERE NegotiatingState = "FORWARDED_TO_ADMIN"`, (error, results) => {
            if (error) {
                console.error('Error retrieving forwarded requests:', error);
                reject(error);
            } else {
                // console.log('Forwarded requests retrieved', results);
                resolve(results);
            }
        })
    });
}

const getClientInfo = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM RestaurantDB.Client`, (error, results) => {
            if (error) {
                console.error('Error retrieving client info:', error);
                reject(error);
            } else {
                // console.log('Client info retrieved', results);
                resolve(results);
            }
        })
    });
}

const getDiscountRules = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM RestaurantDB.DiscountRules`, (error, results) => {
            if (error) {
                console.error('Error retrieving discount rules:', error);
                reject(error);
            } else {
                // console.log('Discount rules retrieved', results);
                resolve(results);
            }
        })
    });
}

const updateDiscountRules = (day, slot_number, people_range, new_val) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE RestaurantDB.DiscountRules SET Discount = ? WHERE Day = ? AND SlotNumber = ? AND PeopleRange = ?`, [new_val, day, slot_number, people_range], (error, results) => {
            if (error) {
                console.error('Error updating discount rules:', error);
                reject(error);
            } else {
                console.log('Discount rules updated', results);
                resolve(results);
            }
        })
    });
}

const clearClientDetails = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM RestaurantDB.Client WHERE PhoneNumber = ?', [phone_number], (error, results) => {
            if (error) {
                console.error('Error clearing client details:', error);
                reject(error);
            } else {
                console.log('Client details cleared', results);
                resolve(results);
            }
        });
    });
}

const clearNegLogDetails = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM RestaurantDB.NegotiationLog WHERE PhoneNumber = ?', [phone_number], (error, results) => {
            if (error) {
                console.error('Error clearing negotiation log:', error);
                reject(error);
            } else {
                console.log('Negotiation log cleared', results);
                resolve(results);
            }
        });
    });
}

const clearConversationLog = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM RestaurantDB.ConversationLog WHERE PhoneNumber = ?', [phone_number], (error, results) => {
            if (error) {
                console.error('Error clearing conversation log:', error);
                reject(error);
            } else {
                console.log('Conversation log cleared', results);
                resolve(results);
            }
        });
    });
}

const storeConversation = (phone_number, sender, message) => {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO RestaurantDB.ConversationLog (PhoneNumber, Sender, SendTime, Message) VALUES (?, ?, CURRENT_TIMESTAMP(), ?)', [phone_number, sender, message], (error, results) => {
            if (error) {
                console.error('Error storing conversation:', error);
                reject(error);
            } else {
                console.log('Conversation stored', results);
                resolve(results);
            }
        })
    });
}

const getConversation = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM RestaurantDB.ConversationLog WHERE PhoneNumber = ?', [phone_number], (error, results) => {
            if (error) {
                console.error('Error retrieving conversation:', error);
                reject(error);
            } else {
                console.log('Conversation retrieved', results);
                resolve(results);
            }
        })
    });
}

const clearBookingDetails = (phone_number) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM RestaurantDB.Bookings WHERE PhoneNumber = ?', [phone_number], (error, results) => {
            if (error) {
                console.error('Error clearing booking details:', error);
                reject(error);
            } else {
                console.log('Booking details cleared', results);
                resolve(results);
            }
        });
    });
}

const closeConnection = () => {
    connection.end();
}

// const details = await getMaxPermissibleDiscount(2, 1, 2);
// console.log(details[0].Discount);

export default {
    connection, startConnection, addClient, updateClientState, createNewBooking,
    getBookings ,closeConnection, getClientDetails, addNegLog, storeTimeSlot,
    storePeopleRange, storeDiscount, getMaxPermissibleDiscount,
    getNegLogDetails, updateLogState, clearClientDetails, clearNegLogDetails,
    getForwardedRequests, getClientInfo, getDiscountRules, updateDiscountRules,
    storeConversation, getConversation, clearConversationLog, clearBookingDetails
}
