import User from './models/User';
import bcrypt from 'bcrypt';

export const createUser = async (userData: { email: string; username: string; password: string; profilePicture?: string; }) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = new User({
    ...userData,
    password: hashedPassword,
    createdAt: new Date()
  });
  return await user.save();
};

export const getUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};