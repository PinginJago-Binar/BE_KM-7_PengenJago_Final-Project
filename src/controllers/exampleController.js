import asyncWrapper from "../utils/asyncWrapper.js"

const createExample = asyncWrapper(async (req, res) => {
  // Logika codigan endpoint kamu  
})

const filterExample = asyncWrapper(async (req, res) => {
  // Logika codigan endpoint kamu
  return res.status(200).json({
    message: "success"
  });
})

export {
  createExample,
  filterExample
}