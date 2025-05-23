import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

type UserPayload = {
  id: string;
  email: string;
  username?: string;
};

export function generateToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: "1d", // Token valid for 7 days
    }
  );
}
