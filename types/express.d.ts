export {};

// declare global {
  declare module 'express' {
    export interface Request {
      user: number;
    }
  }
// }
