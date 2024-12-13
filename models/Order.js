import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  clientId: {
    type:mongoose.Schema.Types.ObjectId, 
    required: true
  },
  items: {
    type: Array,
    default: [],
  },
  restaurantId: {
    type:mongoose.Schema.Types.ObjectId, 
    required: true
  },
  totalPrice: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Order = mongoose.model('Order', OrderSchema)

export { Order }