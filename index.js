const connectToMongo = require('./db')
const express = require('express')
const cors = require('cors')
const cron = require('node-cron');

require('dotenv').config()
connectToMongo();

const app = express()
app.use(cors())
const port = process.env.PORT
const url = process.env.URL
app.use(express.json())

//Routes 

app.use('/api/auth', require('./routes/Users/R_Users'))

app.use('/api/weekend', require('./routes/Weekend/R_Weekend'))



app.listen(port, () => {
    console.log(`Weekend Support app listening on port ${port}`)
})

const autoEntry = async () => {
    try {
        const response = await fetch(`${url}/api/weekend/addAutoEntry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            }
        });
        const data = await response.json();
    } catch (error) {
        throw error.message
    }
}

autoEntry()