import { Admin } from './../models/Admin.js'
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async(req, res, next) => {
  try {
    const { name, surname, email, password } = req.body;
    if(validator.isEmail(email)){
      await Admin.find({email:email})
      .then(result => {
        if(result.length >=1) {
          res.json({
            success: false,
            message: "Email đã được sử dụng!"
          });
        }else {
          bcrypt.hash(password, 10, (err, hash) => {
            if(err){
              res.json({
                success:false,
                message: "Không thể mã hoá mật khẩu!",
              })
            }else {
              let admin = new Admin({
                name:name, 
                surname:surname, 
                email:email, 
                password:hash
              })
              admin.save().then(()=> {
                res.json({
                  success: true,
                  message: "Tạo Admin thành công."
                });
              }).catch(err => {
                res.json({
                  success: false,
                  message: `Không thể tạo tài khoản admin.`
                });
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

export const adminLogin = async (req, res, next) => {
  try {
    const  { email, password } = req.body;
    if(validator.isEmail(email)){
      await Admin.find({email:email})
      .then((result) => {
        if(result.length === 0) {
          res.json({
            success:false,
            message:"Không tìm thấy người dùng!",
          });
        }else {
          result.map(item => {
            bcrypt.compare(password, item.password).then(function(match) {
              if(match) {
                const token = jwt.sign({id:item._id, name:item.name, surname:item.surname, email:item.email}, process.env.TOKEN_SECRET, {expiresIn: '24h'})
                res.json({
                  success:true,
                  message:"Xin chào "+item.name+' '+item.surname,
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
        message: "Email không đúng định dạng!"
      })
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi"
    })
  }
}

export const profile = async ( req, res, next ) => {
  const id = req.params.id;
  const { name, surname, email, password } = req.body;

  if(validator.isEmail(email)){
    await bcrypt.hash(password, 10, (err, hash) => {
      if(err){
        res.json({
          success:false,
          message: "Không thể mã hoá mật khẩu",
        })
      }else {
        Admin.findByIdAndUpdate(
          { _id:id }, 
          {
            $set: {
              name:name,
              surname:surname,
              email:email,
              password:hash
            }
          }, 
          {new:true})
          .then((docs) => {
          res.json({
            success: true,
            message: "Cập nhật người dùng thành công.",
            user:docs
          });
        })
        .catch(err => {
          res.json({
            success: false,
            message: `Không thể cập nhật người dùng có id=${id}.`
          });
        });
      }
    })
  }else {
    res.json({                  
      success:false,
      message: "Sai định dạng Email!"
    })
  }
}