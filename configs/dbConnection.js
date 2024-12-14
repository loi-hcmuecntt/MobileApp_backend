import mongoose from 'mongoose';

const dbConnect = async (req, res, next) => {
  await mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log("Kết nối tới database thành công"))
  .catch((err) => {
      console.log("Kết nối thất bại...");
      console.error(err);
      process.exit(1);
  })
}

export {dbConnect};