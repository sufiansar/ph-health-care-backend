// import rateLimit from "express-rate-limit";

// export const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     res.status(429).json({
//       success: false,
//       message: "Too many requests from this IP. Please try again later.",
//     });
//   },
// });

// export const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5, // Limit login attempts
//   skipSuccessfulRequests: true,
//   handler: (req, res) => {
//     res.status(429).json({
//       success: false,
//       message: "Too many login attempts. Please try again later.",
//     });
//   },
// });
