/**
 * 
 * Wrapper Utility untuk membungkus async function
 * Jadi kamu bisa handling error tanpa try catch
 * 
 * @param {*} fn 
 * @returns 
 */
const asyncWrapper = (fn) => {
  return (req, res, next) => {
      fn(req, res, next).catch(next);
  };
}

export default asyncWrapper;