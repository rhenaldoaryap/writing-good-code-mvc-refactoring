function getSessionErrorData(req, defaultValue) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      ...defaultValue,
    };
  }

  req.session.inputData = null;

  return sessionInputData;
}

function flashErrorToSession(req, data, action) {
  req.session.inputData = {
    hasError: true,
    // using spread operator, because every message for error has a different text
    ...data,
  };

  req.session.save(action);
}

module.exports = {
  getSessionErrorData: getSessionErrorData,
  flashErrorToSession: flashErrorToSession,
};
