import { useContext, useState, useEffect, useRef } from "react";

import { ChatContext } from "../../context/ChatProvider";
import { fetchMessagesApi, sendMessageApi } from "../../service/messagesApi";
import Messages from "./singleChat/Messages";

import Lottie from "lottie-react";
import animationData from "../../animations/typing.json";
import {
  Box,
  Typography,
  styled,
  Alert,
  Snackbar,
  CircularProgress,
  InputBase,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

// MUI STYLED COMPONENTS
const MessagesContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  background: #0a1929;
  padding: 0.5em;
  margin-left: 5px;
  margin-right: 5px;
  overflow-y: scroll;
  scroll-behavior: smooth;
  height: 90%;
  border-bottom: 1px solid #2e3b49;
`;
const NewMessageContainer = styled(Box)`
  display: flex;
  justify-content: left;
  align-items: center;
  background: #0a1929;
`;
const StyledInputBase = styled(InputBase)`
  color: white;
  font-family: work sans;
  width: 100%;
  margin: 0.3em 0 0.3em 0.5em;
  & > :hover {
    background: #2e3b49;
  }
  & > textarea {
    border-radius: 3px;
    padding: 0.3em;
  }
`;

const ChatingBox = ({ socket, socketConnected, fetchAgain, setFetchAgain }) => {
  const myRef = useRef(null);
  const executeScroll = () => myRef.current.scrollIntoView();
  const { selectedChat, token, notifications, setNotifications } =
    useContext(ChatContext);

  //messages state
  const [messages, setMessages] = useState([]); //all messages in chat
  const [newMessage, setNewMessage] = useState("");

  // realtime chat animation utils
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  //alerts states
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

  // variabele to compare selected-chat and current chat with other users
  var selectedChatCompare = selectedChat;
  useEffect(() => {
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  //recieving message from backend(socket) to either display message or give notification
  useEffect(() => {
    socket &&
      socket.on("message-recieved", (newMessageRecieved) => {
        if (
          !selectedChatCompare ||
          selectedChatCompare._id !== newMessageRecieved.chat._id
        ) {
          if (!notifications.includes(newMessageRecieved)) {
            setNotifications([newMessageRecieved, ...notifications]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          console.log("message");
          setMessages([...messages, newMessageRecieved]);
        }
      });
  }, [messages, notifications]);

  socket.on("typing", () => {
    setIsTyping(true);
  });
  socket.on("stop-typing", () => {
    setIsTyping(false);
  });

  //fetching messsages
  useEffect(() => {
    fetchMessages();
    executeScroll();
  }, [selectedChat]);

  //handeling message typing to give typing animation
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket && socket.emit("typing", selectedChat._id);
    }

    //stop typing after 3 sec
    var lastTypingTime = new Date().getTime();
    var timerLength = 4000;
    setTimeout(() => {
      console.log("time out called");
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength) {
        socket && socket.emit("stop-typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  //featching messages of a chat
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

      // making a room with chat id
      socket && socket.emit("join-Chat", selectedChat._id);
      return;
    } catch (error) {
      setLoading(true);
      setAlertTitle("Failed to Fetch Chats : Refresh !");
      setAlertType("error");
    }
  };

  // send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    socket.emit("stop-typing", selectedChat._id);
    let message = newMessage.trim();
    if (!message) {
      setLoading(true);
      setAlertTitle("Type a message...");
      setAlertType("info");
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      setNewMessage("");
      const { data } = await sendMessageApi(
        {
          chatId: selectedChat._id,
          content: message,
        },
        config
      );
      // console.log(data);

      //sending messages to every user in room
      socket.emit("new-message", data);

      setMessages([...messages, data]);
      executeScroll();
      return;
    } catch (error) {
      setLoading(true);
      setAlertTitle("Failed to send Message : Try Again");
      setAlertType("error");
    }
  };

  return (
    <>
      {chatLoading ? (
        <>
          <MessagesContainer
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <CircularProgress />
          </MessagesContainer>
        </>
      ) : (
        <>
          {/* All Messages */}
          <MessagesContainer>
            {messages &&
              messages.map((message, index) => (
                <Messages
                  key={message._id}
                  message={message}
                  messages={messages}
                  index={index}
                />
              ))}
            <Typography
              sx={{ background: "#0a1929", height: "5px" }}
              ref={myRef}
            ></Typography>
            {isTyping ? (
              <div>
                {" "}
                <Lottie
                  animationData={animationData}
                  style={{ width: 70 }}
                  loop={true}
                  autoplay={true}
                />{" "}
              </div>
            ) : (
              <></>
            )}
          </MessagesContainer>

          {/* new message input*/}
          <NewMessageContainer>
            <StyledInputBase
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(e);
              }}
              multiline
              value={newMessage}
              maxRows={"1"}
              placeholder="Type a message..."
              onChange={typingHandler}
              // onChange={(e) => setNewMessage(e.target.value)}
            />
            <IconButton
              sx={{ color: "whitesmoke" }}
              size="medium"
              onClick={sendMessage}
            >
              <SendIcon />
            </IconButton>
          </NewMessageContainer>
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
