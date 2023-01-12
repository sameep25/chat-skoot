import React from "react";
import { useState, useContext } from "react";
import { ChatContext } from "../../context/ChatProvider";
import { useNavigate } from "react-router-dom";

import ProfileModal from "./ProfileModal";

import {
  Box,
  styled,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Logout from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";

const StyledMenu = styled(Menu)`
  & .MuiPaper-root {
    background-color: #203246;
    color: #fff;
  }
  ,
  & .MuiList-root {
    padding-top: 0px;
    padding-bottom: 0px;
  }
`;
const UserMenu = () => {
  const navigate = useNavigate();
  const { user, setUser ,notifications ,setNotifications } = useContext(ChatContext);
  // console.log("Menu USer : " ,user);

  // handing notefication menu
  const [notificationMenu, setNotificationMenu] = useState(null);
  const notificationOpen = Boolean(notificationMenu);
  const handleNotificationMenu = (event) => {
    setNotificationMenu(event.currentTarget);
  };

  // handling account menu
  const [accountMenu, setAccountMenu] = useState(null);
  const accountOpen = Boolean(accountMenu);
  const handleAccountMenu = (event) => {
    setAccountMenu(event.currentTarget);
  };

  // close menu-list
  const handleClose = () => {
    setNotificationMenu(null);
    setAccountMenu(null);
  };

  // logout user
  const logoutUser = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  //   Profile - Modal;
  const [openModal, setOpenModal] = useState(false);

  return (
    <Box sx={{ marginLeft: "auto" }}>
      {/* Notifications Button */}
      <IconButton
        size="large"
        color="inherit"
        onClick={handleNotificationMenu}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notifications Menu*/}
      <StyledMenu
        anchorEl={notificationMenu}
        open={notificationOpen}
        onClose={handleClose}
      >
        {
          notifications && notifications?.map((notification) =>(
            <MenuItem key={notification._id} onClick={handleClose}> {notification.content} </MenuItem>
          ))
        }
        {/* <MenuItem onClick={handleClose}>1</MenuItem>
        <MenuItem onClick={handleClose}>2</MenuItem>
        <MenuItem onClick={handleClose}>3</MenuItem> */}
      </StyledMenu>

      {/* Account Menu button */}
      <IconButton size="small" sx={{ ml: 2 }} onClick={handleAccountMenu}>
        <Avatar src={user.picture} sx={{ width: 32, height: 32 }}></Avatar>
      </IconButton>

      {/* Account Menu */}
      <StyledMenu
        anchorEl={accountMenu}
        open={accountOpen}
        onClose={handleClose}
      >
        <MenuItem divider onClick={() => setOpenModal(true)}>
          <ListItemIcon>
            <AccountCircle sx={{ color: "white" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={logoutUser}>
          <ListItemIcon>
            <Logout sx={{ color: "white" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </StyledMenu>

      {/* User Profile Details Modal */}
      <ProfileModal
        user={user}
        open={openModal}
        close={() => setOpenModal(false)}
      />
    </Box>
  );
};

export default UserMenu;
