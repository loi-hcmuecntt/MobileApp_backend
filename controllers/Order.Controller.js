import { Order } from '../models/Order.js'
import { Client } from '../models/Client.js'
import { sendMail } from '../helpers/email.helper.js'

export const findAll = async ( req, res, next ) => {
  const orders = await Order.find()
  res.json({
    success: true,
    orders: orders
  })
}

export const getHistory = async ( req, res, next ) => {
  const id = req.params.id;
  const orders = await Order.find({ clientId: id })
  res.json({
    success: true,
    orders: orders
  })
}

export const create = async ( req, res, next ) => {
  const { clientId, items, restaurantId, totalPrice, paymentType, paid } = req.body;
  let order = new Order({
    clientId:clientId, 
    items:items, 
    restaurantId:restaurantId, 
    totalPrice:totalPrice, 
    paymentType:paymentType, 
    paid:paid,
  });
  order.save().then(()=> {
    res.json({
      success: true,
      message: "Đặt hàng thành công."
    });
  }).catch(err => {
    res.json({
      success: false,
      message: `Không thể đặt hàng lúc này`
    });
  })
}

export const handleStatus = async ( req, res, next ) => {
  const id = req.params.id;
  const status = req.body.status
  await Order.findByIdAndUpdate(
    {_id: id},
    {$set:{status:status}}, 
    { new: true}
  )
  .then(() => {
    res.json({
      success: true,
      message: "Đơn hàng cập nhật thành công."
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể cập nhật đơn hàng có id=${id}.`
    });
  });
}

export const remove = async ( req, res, next ) => {
  const id = req.params.id;
  await Order.deleteOne({_id: id})
  .then(() => {
    res.json({
      success: true,
      message: "Đơn hàng xoá thành công!"
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể xoá đơn hàng với id=${id}.`
    });
  });
}

