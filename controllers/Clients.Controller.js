import { Client } from './../models/Client.js'

export const findAll = async ( req, res, next ) => {
  const clients = await Client.find()
  res.json({
    success: true,
    clients: clients
  })
}

export const handleStatus = async ( req, res, next ) => {
  const id = req.params.id;
  const status = req.body.status

  await Client.findByIdAndUpdate(
    {_id: id},
    {status:status},
    {new: true }
  )
  .then(() => {
    res.json({
      success: true,
      message: "Tài khoản đã được kích hoạt"
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể kích hoạt tài khoản có id=${id}.`
    });
  });
}

export const remove = async ( req, res, next ) => {
  const id = req.params.id;
  await Client.deleteOne({_id: id})
  .then(() => {
    res.json({
      success: true,
      message: "Xoá người dùng thành công!"
    });
  })
  .catch(err => {
    res.json({
      success: false,
      message: `Không thể xoá người dùng có id=${id}.`
    });
  });
}