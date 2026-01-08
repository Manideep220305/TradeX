const mongoose=require('mongoose');

const orderSchema= new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    stockSymbol:{
        type: String,
        required:true
    },
    quantity:{
        type: Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    totalAmount:{
        type: Number,
        required: true
    }
},{timestamp: true});

module.exports=mongoose.model('Order',orderSchema);