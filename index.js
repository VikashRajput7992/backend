const connectToMongo = require('./db');
connectToMongo();

const express = require('express');
var cors = require('cors');

const app = express();
app.use(cors())
const port = 5000; 

app.use(express.json());

//availabe routes 
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));

app.listen(port, () => {
    console.log(`iNotebook backend listening on port ${port}`)
})