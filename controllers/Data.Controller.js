import { Client } from './../models/Client.js'
import { Restaurant } from './../models/Restaurant.js'
import { Order } from './../models/Order.js'

export const dashbord = async (req, res, next) => {
  const clients = await Client.find().count();
  const restaurants = await Restaurant.find().count();    
  const orders = await Order.find().count();    
  
  res.json({
    success: true,
    clients: clients,
    restaurants:restaurants,
    orders: orders
  })
}