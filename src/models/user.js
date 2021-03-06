import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

UserSchema.methods.setPassword = async function (password) {
  // password -> hash 후 저장
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  // hashedPassword로 패스워드 검증.
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; //true or false
};

UserSchema.statics.findByUsername = function (username) {
  // 유저 이름 존재하는지 확인
  return this.findOne({ username });
};

UserSchema.methods.serialize = function () {
  // hashedPassword 제거 후 response에 넣기 위한 용도(ctx.body)
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    //첫번째는 토큰에 넣을 데이터를 넣는다.
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET, // JWT 암호
    {
      expiresIn: '7d',
    },
  );
  return token;
};

const User = mongoose.model('User', UserSchema);
export default User;
