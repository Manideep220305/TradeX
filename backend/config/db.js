const mongoose=require('mongoose');

const connectDB= async () =>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log(`\n----------------------------------------`);
        console.log(`✅MongoDB is connected: ${conn.connection.host}`);
        console.log(`\n-----------------------------------------`);
    }
    catch(error){
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);//stop the app if db fails
    }
};
module.exports=connectDB;