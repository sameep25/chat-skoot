import { useContext, useState, useEffect } from "react";

import { ChatContext } from "../../context/ChatProvider";
import { fetchMessagesApi } from "../../service/messagesApi";

import {
  Box,
  Typography,
  styled,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";

const Container = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a1929;
  height: 85%;
  margin: 0.5em;
  border: 1px solid white;
`;

const ChatingBox = ({ messages, setMessages }) => {
  const { user, selectedChat, setSelectedChat, token } =
    useContext(ChatContext);

  const [chatLoading, setChatLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState("info");
  const [alertTitle, setAlertTitle] = useState("");
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      setChatLoading(true);
      const { data } = await fetchMessagesApi(config, selectedChat._id);
      // console.log(data);
      setMessages(data);
      setChatLoading(false);
    } catch (error) {
      setLoading(true);
      setAlertTitle("Failed to Fetch Chats : Refresh !");
      setAlertType("error");
    }
  };

  return (
    <>
      {chatLoading ? (
        <>
          <Container>
            <CircularProgress />
          </Container>
        </>
      ) : (
        <>
          <Container>{/* Messages */}</Container>
        </>
      )}

      <Snackbar open={loading} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={alertType} sx={{ width: "100%" }}>
          {alertTitle}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatingBox;
