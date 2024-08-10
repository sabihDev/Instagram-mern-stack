import React from 'react'
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ExploreIcon from "@mui/icons-material/Explore";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import { Avatar } from "@mui/material";
import './Sidebar.css'

const Sidebar = () => {
    return (
        <div className="sidenav">
            <a href="/">
                <img
                    className="sidenav__logo"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz3GOa09_CQMYmfIdDYXaBzmcVTpSuvTeSpQ&sing.png"
                    alt="Instagram Logo"
                />
            </a>

            <div className="sidenav__buttons">
                <a href="/" className="sidenav__button">
                    <HomeIcon />
                    <span>Home</span>
                </a>
                <button className="sidenav__button">
                    <SearchIcon />
                    <span>Search</span>
                </button>
                <a href="/explore" className="sidenav__button">
                    <ExploreIcon />
                    <span>Explore</span>
                </a>
                <a href="/reels" className="sidenav__button">
                    <SlideshowIcon />
                    <span>Reels</span>
                </a>
                <a href="/messages" className="sidenav__button">
                    <ChatIcon />
                    <span>Messages</span>
                </a>
                <a href="/notifications" className="sidenav__button">
                    <FavoriteBorderIcon />
                    <span>Notifications</span>
                </a>
                <button className="sidenav__button">
                    <AddCircleOutlineIcon />
                    <span>Create</span>
                </button>
                <button className="sidenav__button col">
                    <Avatar className="sidenav__buttonAvatar">
                        Sabi
                    </Avatar>
                    <span>
                        Profile{" "}
                    </span>
                </button>
            </div>
            <div className="sidenav__more">
                <button className="sidenav__button ham">
                    <MenuIcon />
                    <span className="sidenav__buttonText">More</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar