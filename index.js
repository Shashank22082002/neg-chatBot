import pkg from 'whatsapp-web.js'
const { Client, LocalAuth, Buttons, List, MessageMedia } = pkg;
import db from './dbconnect.js';
import states from './states.js';
import utils from './utilFunctions.js';
const { BOOKING_STATES, NEGOTIATION_STATES, CLIENT_STATES} = states;
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

client.on('ready', () => {
    console.log('READY');
});

const sendMenu = () => {
    const menu = MessageMedia.fromFilePath('./props/menu.jpg');
    return menu;
}

const startBooking = () => {
    return "Starting booking..."
}


const processMessage = async (msg, phNum, clientState, negotiatingState = NEGOTIATION_STATES.NOPE) => {
    switch (clientState) {
        case CLIENT_STATES.ARRIVED: {
            // console.log(msg, phNum, clientState);
            await db.updateClientState(phNum, CLIENT_STATES.OPTIONS_GIVEN);
            // console.log('Client state updated to OPTIONS_GIVEN');
            return MESSAGES.HELLO;
        }
        case CLIENT_STATES.OPTIONS_GIVEN: {
            switch (msg) {
                case '1':
                    return sendMenu();
                case '2': {
                    // change client state to STARTED_BOOKING
                    await db.updateClientState(phNum, CLIENT_STATES.STARTED_BOOKING);
                    return startBooking();
                }
                case '3': {
                    // change client state to NEGOTIATING
                    await db.updateClientState(phNum, CLIENT_STATES.NEGOTIATING);
                    await db.updateLogState(phNum, NEGOTIATION_STATES.START);
                    // console.log('Negotiating state updated to START');
                    return MESSAGES.ASK_TIME;
                }
                case '4': {
                    return MESSAGES.CONTACT_US;
                }
                case '5': {
                    return "IN PROGRESS\n";
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
                    // console.log('Slot number GOTT', slotNumber);
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
                        const offers = await db.getOffers(phNum);
                        console.log("Here got offers ", offers);
                        if (offers.length > 0) {
                            await db.updateLogState(phNum, NEGOTIATION_STATES.OFFER1_GIVEN);
                            console.log("Negotiating state updated to OFFER1_GIVEN");
                            return MESSAGES.GIVE_OFFER + offers[0].Offer1 + MESSAGES.CONFIRM_OFFER;
                        } else {
                            return MESSAGES.GIVE_OFFER + MESSAGES.DEFAULT_OFFER + MESSAGES.CONFIRM_OFFER;
                        }
                    } else {
                        return MESSAGES.FAILED_PARSING_PEOPLE;
                    }
                }
                case NEGOTIATION_STATES.SIZE_OF_BOOKING_KNOWN: {
                    const offer = await db.getOffers(phNum);
                    
                    if (offer.length > 0) {
                        await db.updateLogState(phNum, NEGOTIATION_STATES.OFFER1_GIVEN);
                        return MESSAGES.GIVE_OFFER + offer[0].Offer + MESSAGES.CONFIRM_OFFER;
                    } else {
                        return MESSAGES.GIVE_OFFER + MESSAGES.DEFAULT_OFFER + MESSAGES.CONFIRM_OFFER;
                    }
                }
                case NEGOTIATION_STATES.OFFER1_GIVEN: {
                    switch (msg) {
                        case '1': {
                            await db.updateLogState(phNum, NEGOTIATION_STATES.ACCEPTED);
                            await db.updateClientState(phNum, CLIENT_STATES.ARRIVED);
                            return MESSAGES.OFFER_ACCEPTED;
                        }
                        case '2': {
                            await db.updateLogState(phNum, NEGOTIATION_STATES.NOPE);
                            await db.updateClientState(phNum, CLIENT_STATES.ARRIVED);
                            return MESSAGES.BYE;
                        }
                        default: {
                            return MESSAGES.INVALID_OPTION;
                        }
                    }
                }
                case NEGOTIATION_STATES.ACCEPTED: {
                    await db.updateClientState(phNum, CLIENT_STATES.ARRIVED);
                    return MESSAGES.OFFER_ALREADY_APPLIED;
                }
            }
        }
        case CLIENT_STATES.STARTED_BOOKING: {
            return MESSAGES.BOOKING_MESSAGE;
        }
    }
}

client.on('message', async msg => {
    const chat = await msg.getChat();
    console.log('MESSAGE RECEIVED', msg);
    if (chat.isGroup && msg.author === "919829091373@c.us") {
        const phNum = utils.extractPhNum(msg.author);
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
