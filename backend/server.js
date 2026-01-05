//this is where the server starts
const express=require('express');
const dotenv=require('dotenv');
const cors=require('cors');
const connectDB=require('./config/db');
const userRoutes=require('./routes/userRoutes');

//1. load env variables
dotenv.config();
//2. connect to database
connectDB();

const app=express();

//3. middleware
app.use(cors());//allows frontend and backend which work on diff ports to work in the same port, basically gives permission , so that the browser doesnt show error that they are in diff ports
app.use(express.json());//parses the json request bodies and puts them in req.body

//4. test route
app.use('/api/users',userRoutes);

//5. start server
const PORT=process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

//server.js is always going to be like this , it has only 5 steps