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


const createNewBooking = (phone_number, no_of_people, special_occasion, AmountRecieved) => {
    connection.query('INSERT INTO RestaurantDB.Bookings (BookingID, PhoneNumber, StartTime, NumberOfPeople, SpecialOccasion, Status, AmountRecieved, TotalCost) VALUES (?, ?, NOW(), ?, ?, "Initiated", ?, 0)', [generateUniqueId(), phone_number, no_of_people, special_occasion, AmountRecieved], (error, results) => {
        if (error) throw error;
        console.log('New booking created', results);
    });
    // write query to reserve table in database
}

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

const getDefaultOffer = () => {
    return "Get 10% off on your next order!";
}

const getOffersBasedOnPreviousBookings = (phone_number) => {
    // write query to get previous bookings
    // write query to get offers based on previous bookings
    return "Get 20% off on your next order!";
}

const fetchOfferFromTable = (slotNumber, peopleRange, negState) => {
    // if negState is RANGE_KNOWN, give offer from Offer1 column
    // if negState is OFFER1_GIVEN, give offer from Offer2 column
    // if negState is OFFER2_GIVEN, give offer from Offer3 column
    const column = negState === 'RANGE_KNOWN' ? 'Offer1' : negState === 'OFFER1_GIVEN' ? 'Offer2' : 'Offer3';
    console.log('column here', column);
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM RestaurantDB.Offers WHERE slotNumber = ? AND peopleRange = ?', [slotNumber, peopleRange], (error, results) => {
            if (error) {
                console.error('Error retrieving offer:', error);
                reject(error);
            } else {
                console.log('Offer retrieved', results);
                resolve(results);
            }
        });
    });
}

const getOffers = async (phNum) => {
    // get values from NegLogTable
    // if no value found, return default offer
    const values = await getNegLogDetails(phNum);
    if (values.length > 0) {
        const slotNumber = values[0].SlotNumber;
        const peopleRange = values[0].PeopleRange;
        console.log('values here', values);
        if (slotNumber !== null && peopleRange !== null) {
            return await fetchOfferFromTable(slotNumber, peopleRange, values[0].NegotiatingState);
        }
    }
    return null;
}

const insertOffers = (slot_number, people_range, offer1, offer2, offer3) => {
    connection.query(`INSERT INTO RestaurantDB.Offers (SlotNumber, PeopleRange, Offer1, Offer2, Offer3) 
    VALUES (?, ?, ?, ?, ?)`, [slot_number, people_range, offer1, offer2, offer3], (error, results) => {
        if (error) throw error;
        console.log('Offers inserted', results);
    });
}

// --------------------------------------AFTER BOOKING FUNCTIONS----------------------------------------- //

const getItemPrice = (item_id) => {
    connection.query('SELECT Price FROM RestaurantDB.Menu WHERE ItemID = ?', [item_id], (error, results) => {
        if (error) throw error;
        console.log('Item price retrieved', results);
        return results;
    });
}

const createNewOrder = (booking_id, item_id, quantity) => {
    /**
     * `OrderID` varchar(15) PRIMARY KEY,
  `BookingID` varchar(15),
  `ItemID` varchar(15),
  `Quantity` integer,
  `Cost` double
     */
    // const price = await getItemPrice(item_id);
    // calculate cost from price
    const cost = getItemPrice(item_id) * quantity;
    connection.query('INSERT INTO orders (BookingID, ItemID, Quantity, Cost) VALUES (?, ?, ?, ?)', [booking_id, item_id, quantity, cost], (error, results) => {
        if (error) throw error;
        console.log('New order created', results);
    });
}

const calculateBill = (booking_id) => {
    // calculate bill from orders
    connection.query('SELECT SUM(Cost) FROM orders WHERE BookingID = ?', [booking_id], (error, results) => {
        if (error) throw error;
        console.log('Bill calculated', results);
        return results;
    });
}

const updateBooking = (booking_id) => {
    // update completion time, total cost
    connection.query('UPDATE bookings SET CompletionTime = NOW(), TotalCost = ? WHERE BookingID = ?', [calculateBill(booking_id), booking_id], (error, results) => {
        if (error) throw error;
        console.log('Booking updated', results);
    });
    // free tables which were reserved
}

const cancelBooking = (booking_id) => {
    // update status
    connection.query('UPDATE bookings SET Status = "Cancelled" WHERE BookingID = ?', [booking_id], (error, results) => {
        if (error) throw error;
        console.log('Booking cancelled', results);
    });
    // also free tables if reserved any
}

const closeConnection = () => {
    connection.end();
}

export default {
    connection, startConnection, addClient, updateClientState, createNewBooking,
    createNewOrder, updateBooking, cancelBooking, closeConnection, insertOffers,
    getOffers, getDefaultOffer, getOffersBasedOnPreviousBookings, getClientDetails,
    addNegLog, storeTimeSlot, storePeopleRange, getNegLogDetails, updateLogState
}
