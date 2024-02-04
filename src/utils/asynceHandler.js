const asynceHandler = (requestHandler) => {
  (req, res, next) => {
      Promise.resolve
          (requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asynceHandler };

    
    
    
    
    
    
    
    
    
    
//const asyncHandler = () => { }
//const asyncHandler = (func) => () => {};
//const asyncHandler = (func) => async() => {};

// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//       await func(req,res,next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//         succuss: false,
//         message: error.message
//     });
//   }
// };
