import axios from "axios";

const URL = "http://localhost:8000/api/chat";

export const accessChatApi = async (userId, config) => {
  try {
    return axios.post(`${URL}/`, { userId }, config);
  } catch (error) {
    console.log("Error while calling accessChatApi : ", error);
  }
};
