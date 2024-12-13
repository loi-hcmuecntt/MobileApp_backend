import { Client } from './../models/Client.js'
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { sendMail } from './../helpers/email.helper.js'

export const register = async (req, res, next) => {
  try {
    const { name, surname, phone, address, status, email, password } = req.body;
    if(validator.isEmail(email)){
      await Client.find({email:email})
      .then(result => {
        if(result.length >=1) {
          res.json({
            success: false,
            message: "Tên người dùng đã tồn tại!"
          });
        }else {
          bcrypt.hash(password, 10, (err, hash) => {
            if(err){
              res.json({
                success:false,
                message: "Lỗi mã hoá mật khẩu!",
              })
            }else {
              const plainPassword = CryptoJS.AES.encrypt(password, process.env.CRYPTO_SECRET).toString();
              let client = new Client ({
                name:name, 
                surname:surname,
                phone:phone,
                address: address,
                email:email, 
                password:hash,
                plainPassword: plainPassword
              })
              client.save((err, doc) => {
                if(err){
                  res.json({
                    success: false,
                    message: `Không thể tạo tài khoản bây giờ.`
                  });
                }else {
                  res.json({
                    success: true,
                    message: "Tài khoản tạo thành công.",
                    user: doc
                  });
                } 
              })
            }
          })
        }
      })
    }else {
      res.json({                  
        success:false,
        message: "Sai định dạng Email!"
      })
    }
  } catch (error) {
    res.json({
      success: false,
      message: error
    });
  }
}

export const login = async (req, res, next) => {
  try {
    const  { email, password } = req.body;
    if(validator.isEmail(email)){
      await Client.find({email:email})
      .then((result) => {
        if(result.length === 0) {
          res.json({
            success:false,
            message:"Không tìm thấy người dùng!"
          });
        }else {
          result.map(item => {
            bcrypt.compare(password, item.password).then(function(match) {
              if(match) {
                  const token = jwt.sign({
                    id:item._id, 
                    name:item.name, 
                    surname:item.surname, 
                    email:item.email
                  }, process.env.TOKEN_SECRET, {expiresIn: '24h'})
                  res.json({
                    success:true,
                    message:"Chào mừng "+item.name+' '+item.surname,
                    user: item,
                    token:token
                  })
              }else {
                res.json({
                  success:false,
                  message:"Sai mật khẩu!"
                })
              }
            });
          })
        }
      })
    }else {
      res.json({
        success:false,
        message: "Sai định dạng Email!"
      })
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra"
    })
  }
}

export const profile = async ( req, res, next ) => {
  const id = req.params.id;
  const { name, surname, phone, address } = req.body;
  await Client.findByIdAndUpdate(
    {_id: id},
    { 
      $set:{
        name:name, 
        surname:surname,
        phone:phone,
        address: address,
      }
    },
    {new:true}
  ).then(() => {
    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công."
    });
  }).catch((error) => {
    res.json({
      success: false,
      message: error
    });
  })
}

export const resetpassword = async( req, res, next ) => {
  const { email } = req.body;

  await Client.find({email:email})
  .then((result) => {
    if(result.length === 0) {
      res.json({
        success:false,
        message:"Email "+email+" không tồn tại, vui lòng kiểm tra lại email.",
      });
    }else {
      result.map(item => {
        let plainpass = CryptoJS.AES.decrypt(item.plainPassword, process.env.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);
        var message = {
          from: "shopeefood@application.com",
          to: email,
          subject: "Reset Email",
          html: "<p> Hello, <strong>"+item.name+' '+item.surname+"</strong> </p> <br> <p> Your Password :<strong>"+plainpass +"</strong></p>"
        }
        let mail = sendMail(message);
        res.json({
          success: true,
          message: "Kiểm tra email của bạn"
        })
      })
    }
  })
}

export const changePassword = async (req, res, next) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body;
  await Client.find({_id:id})
  .then((result) => {
    if(result.length === 0) {
      res.json({
        success:false,
        message:"Không tìm thấy tài khoản",
      });
    }else {
      result.map(item => {
        bcrypt.compare(currentPassword, item.password).then(function(match) {
          if(match) {
            bcrypt.hash(newPassword, 10, (err, hash) => {
              if(err){
                res.json({
                  success:false,
                  message: "Đã có lỗi xảy ra",
                })
              }else {
                const plainPassword = CryptoJS.AES.encrypt(newPassword, process.env.CRYPTO_SECRET).toString();
                Client.findByIdAndUpdate(
                  {
                    _id:id
                  },
                  {
                    $set:{
                      password:hash,
                      plainPassword: plainPassword
                    }
                  },
                  { new: true }
                ).then(() => {
                  res.json({
                    success: true,
                    message: "Cập nhật mật khẩu thành công."
                  });
                }).catch((error) => {
                  res.json({
                    success: false,
                    message: error
                  });
                })
              }
            })
          }else {
            res.json({
              success:false,
              message:"Mật khẩu hiện tại không chính xác!"
            })
          }
        });
      })
    }
  })

}

export const ChangeEmail = async( req, res, next ) => {
  const id = req.params.id;
  const { currentEmail, newEmail } = req.body;
  if(validator.isEmail(currentEmail) || validator.isEmail(newEmail)){
    await Client.find({email:currentEmail, _id:id})
    .then((result) => {
      if(result.length === 0) {
        res.json({
          success:false,
          message:"Email "+currentEmail+" không chính xác, kiểm tra lại email",
        });
      }else {
        Client.findByIdAndUpdate(
          {_id: id},
          {
            $set:{email:newEmail}
          },
          {
            new:true
          }
        ).then(() => {
          res.json({
            success: true,
            message: "Địa chỉ email cập nhật thành "+newEmail+" thành công."
          });
        }).catch((err) => {
          res.json({
            success: false,
            message: err
          });
        })
      }
    })
  }else {
    res.json({
      success:false,
      message: "Sai định dạng Email!"
    })
  }

}