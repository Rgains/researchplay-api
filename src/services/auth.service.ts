import { Request, Response } from "express";
import logger from "../utils/logger";
import User from "../models/Account/User";
import { acctStatuses, acctTypes } from "../types";
import { currentConfig } from "../utils/config";
import { hasher } from "../utils/password-hasher";
import { compare } from "bcryptjs";
import { generateAccessToken, generateAcctVerificationToken, generateRefreshToken, generateVerificationCode } from "../utils/token-generator";
import Institute from "../models/Institution/Institute";
import mailService from "./mail.service";
import jwt from 'jsonwebtoken';
import { isExpired } from "../middleware/auth";

class AuthService {
  constructor() {}

  /** Start Users Auth */
  async register(req: Request, res: Response) {
    const { email, password, fname, lname, username } = req.body ?? {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "email and password are required." });
    }

    try {
      const acct = await User.findOne({ email: email });

      if (acct) {
        logger.info("[NEW SIGN UP] duplicate email", acct.email);
        return res
          .status(409)
          .json({ error: "An account with this email already exists." });
      }

      const newuser = new User();
      newuser.email = email;
      newuser.password = hasher(password);
      // newuser.acctType.push(acctTypes[1]);

      if (fname) newuser.fname = fname;
      if (lname) newuser.lname = lname;
      if (username) newuser.username = username;

      const saved_user = await newuser.save();

      const verification_code = generateVerificationCode();
      const verification_token = generateAcctVerificationToken({ email: email, code: verification_code });

      logger.info("[NEW SIGN UP] successful", saved_user);

      mailService.sendVerificationTokenMail(verification_code, verification_token);

      res.status(201).json({
        message: "Account created successfully! Please, check your mail to complete your account verification",
        user: saved_user,
      });
    } catch (error) {
      console.log(error);
      logger.error("[NEW SIGN UP] failed sign up attempt", error);
      return res
        .status(500)
        .json({ status: "internal server error", error: error });
    }
  }

  async login(req: Request, res: Response) {
    const email = req.body.email; 
    const entered_password = req.body.password;

    if (!email || !entered_password) {
      res.status(400).json({
        status: 400,
        statusText: "Bad Request",
        message: "kindly provide a valid email and password",
      });
    }
    
    try {
      const acct = await User.findOne({ email: email }).lean();

      if (!acct || !compare(entered_password, hasher(entered_password))) {
        logger.info("[LOGIN ATTEMPT] failed, incorrect credentials", acct);
        return res
          .status(401)
          .json({ 
            statusCode: 401,
            statusText: "Invalid Credentials",
            message: "Email or password is incorrect." 
          });
      }

      if(acct.verified === false || acct.status !== acctStatuses[0]) {
        return res.status(401).json({
          statusCode: 401,
          statusText: "Account inactive or unverified!",
          message: "Kindly verify your account or get in touch with support to activate your account!"
        });
      }

      const access_token = generateAccessToken({ id: acct._id, email: acct.email, acctType: acct.acctType });
      const refresh_token = generateRefreshToken({ id: acct._id, email: acct.email, acctType: acct.acctType });

      logger.info("[LOGIN ATTEMPT] successful", acct);

      res.cookie('access_token', access_token, {
        sameSite: currentConfig.env == 'development' ? 'lax' : 'none',
        maxAge: 7200000,
        secure: currentConfig.env == 'development' ? false : true,
        httpOnly: true,
        path: '/'        
      })
      .cookie('refresh_token', refresh_token, {
        sameSite: currentConfig.env == 'development' ? 'lax' : 'none',
        maxAge: 172800000,
        secure: currentConfig.env == 'development' ? false : true,
        httpOnly: true,
        path: '/'
      })
      .json({
        status: 200,
        message : 'Logged in successfully!'
      });
    } catch (error) {
      console.log(error);
      logger.error("[LOGIN ATTEMPT] failed login attempt", error);
      return res
        .status(500)
        .json({ status: "internal server error", error: error });
    }
  }

  async forgotPassword(req: Request, res: Response) {}

  async resetPassword(req: Request, res: Response) {}

  async resendVerificationLink(req: Request, res: Response) {
    const email = req.body.email;

    if(!email) {
      return res.status(400).json({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Enter a valid email address"
      });
    }

    try {
      const user = await User.findOne({ email: email });

      if(!user) {
        logger.info('[Auth Service] warning alert: request to send account verification link to unregistered email', email);
        return res.status(200).json({
          statusCode: 200,
          statusText: "Success",
          message: "A verification mail has been sent to your email, kindly check."
        });
      }

      const verification_code = generateVerificationCode();
      const verification_token = generateAcctVerificationToken({ email: user?.email, code: verification_code });

      mailService.sendVerificationTokenMail(verification_code, verification_token);

      return res.status(200).json({
        statusCode: 200,
        statusText: "Success",
        message: "A verification mail has been sent to your email, kindly check."
      });
    } catch(error: any) {
      logger.error("[Auth Service] Error on line 140: ");
      res.status(500).json({
        statusCode: 500,
        statusText: "",
        message: ""
      });
    }
  }

  async verifyAccount(req: Request, res: Response) {
    const { token, code } = req.body;

    if(!token || !code) {
      return res.status(401).json({
        statusCode: 401,
        statusText: "",
        message: ""
      });
    }

    try {
      const decoded: any = jwt.decode(token);

      const status = isExpired(decoded);

      if(status) {
        const verification_code = generateVerificationCode();
        const verification_token = jwt.sign(
          { email: decoded?.email, code: verification_code },
          currentConfig.verificationSecret,
          { expiresIn: "1d" },
        );

        /** Resend verification link on expired */
        mailService.sendVerificationTokenMail(verification_code, verification_token);

        /** Throw error and inform user new verfication link has been sent to their mail */
        return res.status(401).json({
          statusCode: 401,
          statusText: "Token expired",
          message: "Kindly check your mail for a new verification token"
        });
      }

      /** Handle token mismatch error */
      if(decoded.code !== code) {
        return res.status(401).json({
          statusCode: 401,
          statusText: "Invalid Code Entered!",
          message: "Please confirm the code you provided and ensure it matches what was sent to your mailbox"
        }); 
      }

      /** Update user profile */
      const acct = await User.findOneAndUpdate(
        { email: decoded?.email },
        { verified: true, status: acctStatuses[0] },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        statusCode: 200,
        statusText: "Account verification complete",
        message: "Congratulations! your account has now been verified"
      });
    } catch(error: any) {
      logger.error("[Auth Service] Error on line 146");
      return res.status(500).json({
        statusCode: 500,
        statusText: "Internal Server Error",
        error: error
      });
    }
  }
  /** End Users Auth */

  /** Start Institution Auth */
  async registerInstitution(req: Request, res: Response) {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email or password was not provided!"
      });
    }

    try {

    } catch(error: any) {

    }
  }

  async instituteLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email or password was not provided!"
      });
    }

    try {
      const institution = await Institute.findOne({ email: email });

      if(!institution || !compare(password, hasher(password))) {
        return res.status(404).json({
          statusCode: 404,
          message: ""
        });
      }

      return res.status(200).json({
        statusCode: 400,
        message: ""
      });
    } catch(error: any) {
      logger.error("[AuthService] Institute Login Error occured on line: 155");
      return res.status(500).json({
        statusCode: 500,
        summary: "Internal Server Error",
        message: ""
      });
    }
  }
  /** End Institution Auth */

  /** Start Admin Authentication */
  async createAdmin(req: Request, res: Response) {
    const { email, password, fname, lname, username } = req.body ?? {};
    if (!email || !password || !fname || !lname || !username) {
      logger.info("[NEW ADMIN] all fields are required");
      return res.status(400).json({ error: "all fields are required." });
    }

    try {
      const acct = await User.findOne({ email: email });

      if (acct) {
        logger.info("[NEW ADMIN] duplicate email", acct.email);
        return res
          .status(409)
          .json({ error: "An account with this email already exists." });
      }

      const newuser = new User();
      newuser.email = email;
      newuser.password = hasher(password);
      newuser.acctType.push(acctTypes[0]);
      newuser.fname = fname;
      newuser.lname = lname;
      newuser.username = username;
      console.log(newuser);

      const saved_user = await newuser.save();

      logger.info("[NEW ADMIN] created successfully:", saved_user);
      res.status(201).json({
        status: "success ok",
        message: "Admin account created successfully",
        admin: saved_user,
      });
    } catch (error) {
      logger.info("[NEW ADMIN] internal server error", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }
  /** End Admin Authentication*/

  /** Start Api Authentication Logic */
  async apiAuth(req: Request, res: Response) {

  }
  /** End Api Authentication Logic */

  async logout(req: Request, res: Response) {}
}

export default new AuthService();
