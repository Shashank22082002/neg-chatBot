## WHATSAPP-WEB CHATBOT

## Steps to set up.
### `1. Setting whatsApp chatbot backend`
<ul>
<li>
  
  Download the repository and open in VS code. Install all required node packages using `npm i`.
</li>
<li>
Open MySQL workbench. Change the password and user name in dbconnect.js file. Copy
code from dbfile.sql and run it in MySQL workbench. This will create the database
locally.
</li>
<li>
Now run command `npm index.js` to run the node server.
Server should start at port 3000 if everything is installed perfectly.
</li>
<li>
If doing for first time, you will get a qr printed on the console, scan that from your
whatsApp application. This will setup it as the admin number for the bot. All
communications from client will be done to this number.
This will also open the whatsApp web application in another window, if whatsApp web
library is installed correctly.
  </li>
</ul>

### `2. Setting up the dashboard`
This is very simple, just navigate to the admin-server folder and do `npm start`. This will start the react
server in localhost 3001.
