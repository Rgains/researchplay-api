import { Request, Response, NextFunction } from "express";
import jwt, { decode } from "jsonwebtoken";
import { acctTypes } from "../types";
import { currentConfig } from "../utils/config";
import { generateAccessToken, generateRefreshToken } from "../utils/token-generator";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; acctType: string };
}

export function isExpired(payload: any) {
  return payload && typeof payload !== 'string' &&
     payload.exp && payload.exp * 1000 < Date.now();
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Sign in to continue." });
  try {
    req.body.user = jwt.verify(header.slice(7), currentConfig.jwtSecret) as AuthedRequest["user"];
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Sign in again." });
  }
}

export function requireAdmin() {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.acctType !== acctTypes[0]) {
      return res
        .status(403)
        .json({ error: "Your account type cannot perform this action." });
    }
    next();
  };
}

export function requireCookie(req: Request, res: Response, next: NextFunction) {
  console.log(req.cookies);

  if(!req.cookies.access_token && !req.cookies.refresh_token) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized! Access Denied.'
    });
  }

  let decoded = req.cookies.access_token ? decode(req.cookies.access_token)  : decode(req.cookies.refresh_token);
  
  if(isExpired(decoded)) {
    decoded = jwt.decode(req.cookies.refresh_token);
    if(isExpired(decoded)) {
      return res.status(401).json({ error: "Session expired. Sign in again." });
    } else {
      const access_token = generateAccessToken(decoded);
      const refresh_token = generateRefreshToken(decoded);

      res.cookie('access_token', access_token, {
        sameSite: currentConfig.env == 'development' ? 'lax' : 'none',
        maxAge: 7200000,
        secure: currentConfig.env == 'development' ? false: true,
        httpOnly: true,
        path: '/' 
      })
      .cookie('refresh_token', refresh_token, {
        sameSite: currentConfig.env == 'development' ? 'lax' : 'none',
        maxAge: 172800000,
        secure: currentConfig.env == 'development' ? false : true,
        httpOnly: true,
        path: '/'
      });

      req.body.user = decoded;
      next();
    }
  } else {
    req.body.user = decoded;

    if(!req.cookies.access_token) {
      console.log(decoded);
      const access_token = generateAccessToken({ id: req.body.user.id, email: req.body.user.email, });

      res.cookie('access_token', access_token, {
        sameSite: currentConfig.env == 'development' ? 'lax' : 'none',
        maxAge: 7200000,
        secure: currentConfig.env == 'development' ? false: true,
        httpOnly: true,
        path: '/' 
      });
    }

    next();
  }
}

export function requirePermission(req: Request, res: Response, next: NextFunction) {
  console.log(req.path);
  next();
}
