import React from "react";
import styles from "./TopBar.module.css";
import SearchBar from "../SearchBar/searchbar/SearchBar";
import Login from "../login/Login";
const TopBar = ({ onHandleLogin, onHandleSearch, onQuery, onSetQuery }) => {
  return (
    <div className={`${styles.bar} ${styles.alignCenter}`}>
      <div className={`${styles.flex} ${styles.alignCenter} ${styles.appName}`}>
        <h1 className="app-name">Playlistify</h1>
      </div>
      <SearchBar
        onSearch={onHandleSearch} // prop mapping happens here: onHandleSearch maps to onSearch in SearchBar
        onQuery={onQuery}
        onSetQuery={onSetQuery}
      />
      <Login onHandleLogin={onHandleLogin} />
    </div>
  );
};

export default TopBar;
