import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import {
  registerSchema,
  loginSchema,
  matchSchema,
  messageSchema,
  sessionSchema,
} from './zodSchemas';

import User from './models/User';
import Match from './models/Match';
import Message from './models/Message';
import Session from './models/Session';

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap-secret-key';

const authenticate = (req: Request, res: Response, next: () => void) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    res.locals.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express) {
  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await User.findOne({ email: data.email });
      if (existing) return res.status(400).json({ message: 'User already exists' });

      const hashed = await bcrypt.hash(data.password, 10);
      const user = await User.create({ ...data, password: hashed });
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.status(201).json({ user, token });
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: 'Register error' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await User.findOne({ email: data.email });
      if (!user) return res.status(401).json({ message: 'User not found' });

      const match = await bcrypt.compare(data.password, user.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.json({ user, token });
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: 'Login error' });
    }
  });

  // Matches
  app.post('/api/matches', authenticate, async (req, res) => {
    try {
      const data = matchSchema.parse({ ...req.body, user1Id: res.locals.userId });
      const match = await Match.create(data);
      res.status(201).json(match);
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: 'Match creation failed' });
    }
  });

  // Messages
  app.post('/api/messages', authenticate, async (req, res) => {
    try {
      const data = messageSchema.parse({ ...req.body, senderId: res.locals.userId });
      const message = await Message.create(data);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: 'Message creation failed' });
    }
  });

  // Sessions
  app.post('/api/sessions', authenticate, async (req, res) => {
    try {
      const data = sessionSchema.parse(req.body);
      const session = await Session.create(data);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: 'Session creation failed' });
    }
  });
}
