import { connection, startConnection, addClient, closeConnection, updateClient, createNewBooking, insertOffers, getOffers } from "./dbconnect.js";

startConnection(connection);

// addClient(8192820820, "John Doe");
// addClient(8192820821, "Jane Doe");
// addClient(8192820822, "John Smith");
// addClient(8192820823, "Jane Smith");

// updateClient(8192820820);
// updateClient(8192820821);

// createNewBooking(8192820820, 1, 0, 0);
// createNewBooking(8192820821, 2, 1, 0);
// createNewBooking(8192820822, 3, 0, 0);

// insertOffers(1, 3, 2, 6, "Get 10% off on your next order!");
// insertOffers(6, 7, 2, 6, "Get 20% off on your next order!");
// insertOffers(8, 9, 5, 10, "Get 30% off on your next order!");

getOffers(2, 3);
getOffers(7, 6);

closeConnection(connection);