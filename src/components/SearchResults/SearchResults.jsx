import React from "react";
import styles from "./SearchResults.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";

const SearchResults = ({ items, playlist, onButtonClick, isPlaylist }) => {
  console.log("Received Playlist in SearchResults:", playlist);
  const filteredItems =
    Array.isArray(playlist) && playlist.length > 0
      ? items.filter((item) => {
          console.log("Calling playlist.some with:", playlist);
          return !playlist.some((playlistItem) => playlistItem.id === item.id);
        })
      : items;

  return (
    <div className={styles.panel}>
      {/* Divider */}
      <div className={styles.panelDivider}></div>
      {/* Card List */}
      <div className={styles.cardList}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className={styles.card}>
              <img
                src={item.imageUrl}
                alt={item.title}
                className={styles.cardImage}
              />
              <div className={styles.cardContent}>
                <div className={styles.spaceBetween}>
                  <div className={styles.textContainer}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardSubtitle}>{item.subtitle}</p>
                  </div>
                  <div className={styles.extraInfo}>
                    <span className={styles.albumName}>
                      {item.album || "Album"}
                    </span>
                  </div>
                </div>
                <span className={styles.duration}>
                  {item.duration || "3:14"}
                </span>

                <button
                  className={`action-button ${
                    isPlaylist ? "remove-button" : "add-button"
                  }`}
                  onClick={() => onButtonClick(item)}
                >
                  <FontAwesomeIcon
                    icon={isPlaylist ? faMinusCircle : faPlusCircle}
                  />
                  {isPlaylist ? "Remove" : "Add"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>
            No results found. Please search again.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
