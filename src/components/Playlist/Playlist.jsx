import React, { useState } from "react";
import styles from "./Playlist.module.css";
import SearchResults from "../SearchResults/SearchResults";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  },
};

const Playlist = ({
  playlist,
  playlistName,
  onCreatePlaylist,
  onSavePlaylist,
  onClearPlaylist,
  onSetPlaylistName,
  onRemoveFromPlaylist,
  isPlaylist,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      {/* Panel Heading */}
      <h2 className={styles.panelHeading}>
        {isPlaylist ? "Your Playlist" : "Search Results"}
      </h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <button className={styles.hiddenBtn} type="submit"></button>
        <input
          className={styles.playlistName}
          value={playlistName}
          type="text"
          placeholder="Name your playlist..."
          onChange={onSetPlaylistName}
        />
        <button className={styles.clrBtn} type="button" onClick={openModal}>
          Clear Playlist
        </button>
      </form>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Clear Playlist"
        style={customStyles}
      >
        <h2>Confirm Clear Playlist</h2>
        <p>Are you sure you want to clear your playlist?</p>
        <button onClick={onClearPlaylist}>Yes</button>
        <button onClick={closeModal}>No</button>
      </Modal>
      {playlist.length === 0 ? (
        <p className={styles.emptyMessage}>
          Your playlist is empty. Please add some songs!
        </p>
      ) : (
        <SearchResults
          title="" // No need for an additional title in SearchResults
          items={playlist}
          onCardClick={() => {}} // No action for card clicks
          onButtonClick={onRemoveFromPlaylist}
          buttonLabel="Remove from Playlist"
          itemClassName={styles.track} // Pass className for individual items
          buttonClassName={styles.removeButton} // Pass className for the button
          isPlaylist={true}
        />
      )}
      <div className={styles.flex}>
        <button onClick={onCreatePlaylist}>Create Playlist</button>
        <button onClick={onSavePlaylist}>Save to playlist</button>
      </div>
    </>
  );
};

export default Playlist;
