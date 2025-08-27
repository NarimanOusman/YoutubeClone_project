export const API_KEY = "AIzaSyB0j8DYr-ysasHg_i-Yau7DEVxaM__CXRw";
const value_convertor = (value) => {
  if (value >= 1000000) {
    return Math.floor(value / 1000000) + "M";
  } else if (value >= 1000) {
    return Math.floor(value / 1000) + "K";
  } else {
    return value;
  }
};

export default value_convertor;
