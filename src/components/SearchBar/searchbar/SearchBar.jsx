import React, { useState } from "react";
import styles from "./SearchBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SearchBar = ({ onQuery, onSetQuery, onSearch }) => {
  const handleInputChange = (event) => {
    onSetQuery(event.target.value);
    console.log("Search query updated:", event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(onQuery);
  };

  return (
    <div className={styles.searchBar}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          value={onQuery}
          onChange={handleInputChange}
          placeholder="What do you want to play?"
        />
        <button className={styles.button} type="submit">
          <FontAwesomeIcon icon={faSearch} /> Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
