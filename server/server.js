import express from 'express';
import db from '../dbconnect.js'

const app = express();
const port = 3000; // Define your desired port
app.use(express.json());

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


app.post('/reply/:phNum', async (req, res) => {
    try {
        const phNum = req.params.phNum;
        const msg = req.body.message;
        console.log("BODY ", msg)
        const id = Math.random().toFixed(6) * 1000000 + Math.random().toFixed(6) * 1000000;
        await db.addToReplyQueue(id.toString(), phNum, msg);
        const data = await db.storeConversation(phNum, 0, msg);
        res.json({ message: 'success', data: data });
    } catch (error) {
        // Handle any errors that occur during the API execution
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});