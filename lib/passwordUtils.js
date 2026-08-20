import bcrypt from "bcrypt";

async function validPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export { hashPassword, validPassword };
