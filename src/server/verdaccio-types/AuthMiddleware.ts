import { NextFunction } from "express"

export interface AuthMiddleware {
  apiJWTmiddleware(): NextFunction
  webUIJWTmiddleware(): NextFunction
}
