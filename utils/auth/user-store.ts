import mongoose from "mongoose";
import User from "../../models/users.ts";

type StoredUser = {
  _id: string;
  email: string;
  password: string;
};

const inMemoryUsers: StoredUser[] = [];

export const findUserByEmail = async (email: string) => {
  if (mongoose.connection.readyState === 1) {
    return User.findOne({ email }).lean();
  }

  return inMemoryUsers.find((user) => user.email === email) ?? null;
};

export const saveUser = async (email: string, password: string) => {
  if (mongoose.connection.readyState === 1) {
    return User.create({ email, password });
  }

  const user: StoredUser = {
    _id: new mongoose.Types.ObjectId().toString(),
    email,
    password,
  };

  inMemoryUsers.push(user);
  return user;
};
