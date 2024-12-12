import Joi from "joi";

const validateInitialStoreCheckoutPersonalData = (body) => {
  return Joi.object({
    orderer: Joi.string().required(),
    passengers: Joi.string().required(),
    seatIds: Joi.string().required(),
  }).validate(body, { stripUnknown: true });
}

const validateStoreCheckoutPersonalData = (body) => {
  return Joi.object({
    userId: Joi.number().integer().positive().required(),
    transactionId: Joi.number().integer().positive().required(),
    orderer: Joi.object({
      fullname: Joi.string().min(3).max(120).required(),
      familyName: Joi.string().min(2).max(120).optional(),
      numberPhone: Joi.string().min(10).max(15).required(),
      email: Joi.string().email().required(),
    }),
    passengers: Joi.array().items(
      Joi.object({
        title: Joi.string().valid('mr', 'mrs', 'boy', 'girl').required(),
        passengerType: Joi.string().valid('adult', 'child', 'baby').required(),
        fullname: Joi.string().min(3).max(120).required(),
        familyName: Joi.string().min(2).max(12).optional(),
        birthDate: Joi.date().less('now').required().messages({
          'date.less': 'Tanggal lahir harus di masa lalu.',
        }),
        citizenship: Joi.string().required(),
        identityNumber: Joi.string().min(3).max(25).required(),
        publisherCountry: Joi.string().required(),
        expiredAt: Joi.date().greater('now').required().messages({
          'date.greater': 'Tanggal kedaluwarsa harus di masa depan.',
        }),
      }).custom((passenger, helpers) => {
        if ((passenger.title === 'boy' || passenger.title === 'girl') && passenger.passengerType !== 'child') {
          return helpers.message('Title "boy" atau "girl" hanya cocok dengan tipe "child".');
        } else if ((passenger.title === 'mr' || passenger.title === 'mrs') && passenger.passengerType !== 'adult') {
          return helpers.message('Title "mr" atau "mrs" hanya cocok dengan tipe "adult".');
        }
        return passenger;
      })
    ),
    seatIds: Joi.array().items(Joi.number().positive()).unique().required(),
  }).custom((data, helpers) => {
    if (data.passengers.length !== data.seatIds.length) {
      return helpers.message('Jumlah penumpang dan kursi harus sama.');
    }
    return data;
  }).validate(body);
}

const validateInitialRequest = (body) => {
  const schema = Joi.object({
    passengers: Joi.string().required(),
    flightIds: Joi.string().required(),
  });
  return schema.validate(body, { stripUnknown: true });
};

const validateBookingData = (body) => {
  const schema = Joi.object({
    passengers: Joi.object({
      adult: Joi.number().integer().min(0).required(),
      child: Joi.number().integer().min(0).required(),
      baby: Joi.number().integer().min(0).required(),
    }).required(),
    userId: Joi.number().integer().positive().required(),
    flightIds: Joi.object({
      departure: Joi.number().integer().positive().required(),
      return: Joi.number().integer().required(),
    }).required(),
    pp: Joi.boolean().required().default(false),
  });
  return schema.validate(body);
};

const validateCheckoutPaymentData = (body) => {
  const schema = Joi.object({
    transactionId: Joi.number().integer().positive().required(),
    userId: Joi.number().integer().positive().required(),
  });

  return schema.validate(body);
}

export {
  validateInitialStoreCheckoutPersonalData,
  validateStoreCheckoutPersonalData,
  validateInitialRequest,
  validateBookingData,
  validateCheckoutPaymentData
}