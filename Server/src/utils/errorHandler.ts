import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

// Simple error wrapper for async functions
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Enhanced error handler middleware
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // console.error('Error:', error);
  
  // Handle different types of errors
  error = handleMongooseError(error);
  error = handleZodError(error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  // Enhanced error response
  const errorResponse: any = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // Add validation errors if they exist
  if (error.errors) {
    errorResponse.errors = error.errors;
  }
    
  res.status(statusCode).json(errorResponse);
};

export class AppError extends Error {
  statusCode: number;
  errors?: any;
  
  constructor(message: string, statusCode: number = 500, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Comprehensive Mongoose Error Handler
export const handleMongooseError = (error: any) => {
  // Duplicate key error (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field as string];
    const message = `${field} '${value}' already exists`;
    return new AppError(message, 400);
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const errors: any = {};
    Object.values(error.errors).forEach((err: any) => {
      errors[err.path] = err.message;
    });
    return new AppError('Validation failed', 400, errors);
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
  }

  // Mongoose timeout error
  if (error.name === 'MongooseTimeoutError') {
    return new AppError('Database operation timed out', 408);
  }

  // Mongoose connection error
  if (error.name === 'MongooseServerSelectionError') {
    return new AppError('Database connection failed', 503);
  }

  return error;
};

// Zod Validation Error Handler
export const handleZodError = (error: any) => {
  if (error instanceof ZodError) {
    const errors: any = {};
    error.issues.forEach((err: any) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return new AppError('Validation failed', 400, errors);
  }
  return error;
};
