import pkg from 'whatsapp-web.js'
const { Client, LocalAuth, MessageMedia } = pkg;
import db from './dbconnect.js';
import states from './states.js';
import utils from './utilFunctions.js';
const { NEGOTIATION_STATES, CLIENT_STATES} = states;
import { MESSAGES } from './messages.js';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false
    }
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', async () => {
    console.log('READY');
    
});

const sendMenu = () => {
    const menu = MessageMedia.fromFilePath('./props/menu.jpg');
    return menu;
}

const AboutUs = () => {
    return "We are a group of students who are trying to build a chatbot for restaurants.\n\nYou can contact us at 918114209694\n\n\nYou can also visit our website at https://www.google.com\n";
}


// write a function to message a client
const messageClient = async (phNum, msg) => {
    const chatId = phNum + '@c.us';
    client.sendMessage(chatId, msg);
}

const processMessage = async (msg, phNum, clientState, negotiatingState = NEGOTIATION_STATES.NOPE) => {
    switch (clientState) {
        case CLIENT_STATES.ARRIVED: {
            await db.updateClientState(phNum, CLIENT_STATES.OPTIONS_GIVEN);
            return MESSAGES.HELLO;
        }
        case CLIENT_STATES.OPTIONS_GIVEN: {
            // ADD LOGIC TO GIVE OPTIONS AGAIN IF USER IS INACTIVE FOR SOME PERIOD OF TIME
            switch (msg) {
                case '1':
                    return AboutUs();
                case '2': {
                    // change client state to STARTED_BOOKING
                    return sendMenu();
                }
                case '3': {
                    return "Offers!! 🚀🚀\n"
                }
                case '4': {
                    return "IN PROGRESS\n";
                }
                case '5': {
                    await db.updateClientState(phNum, CLIENT_STATES.NEGOTIATING);
                    await db.updateLogState(phNum, NEGOTIATION_STATES.START);
                    return MESSAGES.ASK_TIME;
                }
                default: {
                    return MESSAGES.INVALID_OPTION;
                }
            }
        }
        case CLIENT_STATES.NEGOTIATING: {
            console.log("Negotiating state HERE", negotiatingState);
            switch (negotiatingState) {
                case NEGOTIATION_STATES.START: {
                    const slotNumber = utils.extractSlotInfo(msg);
                    if (slotNumber !== null) {
                        await db.storeTimeSlot(phNum, slotNumber);
                        return MESSAGES.ASK_PEOPLE;
                    } else {
                        return MESSAGES.FAILED_PARSING_TIME
                    }
                }
                case NEGOTIATION_STATES.SLOT_KNOWN: {
                    const peopleRange = utils.extractPeopleRange(msg);
                    if (peopleRange !== null) {
                        await db.storePeopleRange(phNum, peopleRange);
                        return MESSAGES.ASK_DISCOUNT;
                    } else {
                        return MESSAGES.FAILED_PARSING_PEOPLE;
                    }
                }
                case NEGOTIATION_STATES.SIZE_OF_BOOKING_KNOWN: {
                    const discountPer = utils.extractDiscountPercentage(msg);
                    if (discountPer !== null) {
                        await db.storeDiscount(phNum, discountPer);
                    } else {
                        return MESSAGES.FAILED_PARSING_DISCOUNT;
                    }
                }
                case NEGOTIATION_STATES.DISCOUNT_KNOWN: {
                    const details = await db.getNegLogDetails(phNum);
                    const discountPer = details[0].DiscountVal;
                    const peopleRange = details[0].PeopleRange;
                    const slotNumber = details[0].SlotNumber;
                    // find day today -- (1 -- 7)
                    const day = new Date().getDay();
                    if (day === 0)
                        day = 7;
                    console.log('Day ', day, ' Slot ', slotNumber, ' People ', peopleRange);
                    const dis = await db.getMaxPermissibleDiscount(day, slotNumber, peopleRange);
                    if (dis !== null) {
                        const discount = dis[0].Discount;
                        if (discount >= discountPer) {
                            await db.updateLogState(phNum, NEGOTIATION_STATES.DISCOUNT_APPLIED);
                            await db.storeConversation(phNum, 1, utils.generateSummary(phNum, slotNumber, peopleRange, discountPer));
                            await db.createNewBooking(phNum, slotNumber, peopleRange, discountPer);
                            return MESSAGES.DISCOUNT_APPLIED;
                        }
                    }
                    // store the conversation summary for the admin
                    await db.updateLogState(phNum, NEGOTIATION_STATES.FORWARDED_TO_ADMIN);
                    await db.storeConversation(phNum, 1, utils.generateSummary(phNum, slotNumber, peopleRange, discountPer));
                    return MESSAGES.FORWARDED_TO_ADMIN;
                }
                case NEGOTIATION_STATES.DISCOUNT_APPLIED: {
                    
                }
                case NEGOTIATION_STATES.WAITING_FOR_REPLY: {
                    await db.updateLogState(phNum, NEGOTIATION_STATES.FORWARDED_TO_ADMIN);
                    await db.storeConversation(phNum, 1, msg);
                }
                
                case NEGOTIATION_STATES.FORWARDED_TO_ADMIN: {
                    // store the message in the database
                    await db.storeConversation(phNum, 1, msg);
                }
            }
            return null;
        }
        case CLIENT_STATES.STARTED_BOOKING: {
            return MESSAGES.BOOKING_MESSAGE;
        }
    }
}

const clients = ["919829091373@c.us", "919876543210@c.us", "918700559622@c.us", "919739049663@c.us",
"918112291400@c.us"];

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);
    if (clients.includes(msg.from)) {
        const phNum = utils.extractPhNum(msg.from);
        if (msg.body === "!clear") {
            await db.clearConversationLog(phNum);
            await db.clearBookingDetails(phNum);
            await db.clearNegLogDetails(phNum);
            await db.clearClientDetails(phNum);
            msg.reply("Cleared");
            return;
        }
        let clientState = CLIENT_STATES.ARRIVED, negotiatingState = NEGOTIATION_STATES.NOPE;
        try {
            const clientDetails = await db.getClientDetails(phNum);
            const negotiatingDetails = await db.getNegLogDetails(phNum);
            console.log(negotiatingDetails);
            if (clientDetails.length > 0) {
                clientState = clientDetails[0].State;
            } else {
                console.log('Client details not found.');
                await db.addClient(phNum, msg._data.notifyName);
            }
            if (negotiatingDetails.length > 0) {
                negotiatingState = negotiatingDetails[0].NegotiatingState;
            } else {
                console.log('Negotiating state not found.');
                await db.addNegLog(phNum);
            }
            console.log('Body ', msg.body);
            const response = await processMessage(msg.body, phNum, clientState, negotiatingState);
            if (response)
                msg.reply(response); 
            else {
                console.log('No response found.');
            }
        } catch (error) {
            console.error('Error fetching client details:', error);
        }
    }
});



import express from 'express';
const app = express();
const port = 3000; // Define your desired port
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next();
});

app.get('/forwarded-requests', (req, res) => {
    // Forwarded requests from the bot will be sent to this endpoint
    db.getForwardedRequests()
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            // Handle any errors that occur during the database query or promise chain
            res.status(500).json({ error: 'An error occurred' });
        });
});

app.get('/client-info', (req, res) => {
    db.getClientInfo()
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            // Handle any errors that occur during the database query or promise chain
            res.status(500).json({ error: 'An error occurred' });
        });
})

app.get('/client-info/:phNum', (req, res) => {
    const phNum = req.params.phNum;
    db.getClientDetails(phNum).then((data) => {
        res.json(data);
    }).catch((error) => {
        res.status(500).json({ error: 'An error occurred' });
    })
})

app.get('/discount-rules', (req, res) => {
    db.getDiscountRules()
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            // Handle any errors that occur during the database query or promise chain
            res.status(500).json({ error: 'An error occurred' });
        });
})

// write an api to load conversation for a specific client given his phone number
app.get('/conversation/:phNum', (req, res) => {
    const phNum = req.params.phNum;
    db.getConversation(phNum)
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            // Handle any errors that occur during the database query or promise chain
            res.status(500).json({ error: 'An error occurred' });
        });
})

app.get('/bookings', (req, res) => {
    db.getBookings()
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            res.status(500).json({ error: 'An error occurred' });
        });
})


app.post('/reply/:phNum', async (req, res) => {
    try {
        const phNum = req.params.phNum;
        const msg = req.body.message;
        console.log("BODY ", msg)
        await db.storeConversation(phNum, 0, msg);
        if (client) {
            client.sendMessage(phNum + '@c.us', msg);
            console.log("Message send to ", phNum);
            res.json({ message: 'success', data: msg });
        } else {
            console.log("Client not initialized");
            res.status(500).json({ error: 'Client not initialized' });
        }
    } catch (error) {
        // Handle any errors that occur during the API execution
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/new-booking', async (req, res) => {
    try {
        const booking = req.body;
        console.log(booking);
        const data = await db.createNewBooking(booking.PhoneNumber, booking.SlotNumber, booking.PeopleRange, booking.Discount);
        await db.updateClientState(req.body.PhoneNumber, CLIENT_STATES.STARTED_BOOKING);
        console.log("Updating state !!!", req.body.PhoneNumber);
        await db.updateLogState(req.body.PhoneNumber, NEGOTIATION_STATES.DISCOUNT_APPLIED);
        res.json({ message: 'success', data: data });
    } catch (error) {
        // Handle any errors that occur during the API execution
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
})

app.post('/change-rules', async (req, res) => {
    try {
        const rules = req.body.rules;
        const data = await db.updateDiscountRules(rules.day, rules.slot_number, rules.people_range, rules.discount_val);
        res.json({ message: 'success', data: data });
    } catch (error) {
        // Handle any errors that occur during the API execution
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});