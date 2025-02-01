import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar/searchbar/SearchBar";
import SearchResults from "./SearchResults/SearchResults";
import Playlist from "./Playlist/Playlist";
import Panel from "../components/panel/Panel";
import Login from "../components/login/Login";
import TopBar from "../components/topBar/TopBar";
import { currentToken, login } from "../services/auth";
import { searchSpotify } from "../services/SpotifyApi";
import { Container, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../App.css";
import styles from "../components/SearchResults/SearchResults.module.css";
import { toast } from "react-toastify";
import Modal from "react-modal";
import "@fortawesome/fontawesome-free/css/all.css";
import UserProfile from "./userProfile/UserProfile";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");

const App = () => {
  const [query, setQuery] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({
    tracks: [],
    albums: [],
    podcasts: [],
  });
  const [playlist, setPlaylist] = useState([]);
  const [playlistId, setplaylistId] = useState(null);

  const handleCardClick = (item) => {
    console.log(`Card clicked: item`);
  };

  // The Uri is the resource identifier of, for example, an artist, album or track
  const addTrackToPlaylist = async (playlistId, trackUris) => {
    console.log("Track URIs to add:", trackUris);

    if (!playlistId || trackUris.length === 0) {
      toast.warn("Playlist ID or tracks missing");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: trackUris,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to add tracks:", errorData);
        toast.error("Failed to add tracks to playlist!");
        return;
      }

      console.log("Tracks successfully added to playlist!");
      toast.success("Tracks successfully added to playlist!");
    } catch (error) {
      console.error("Error adding tracks to playlist:", error);
      toast.error("An error occurred while adding tracks to the playlist.");
    }
  };

  const handleAddToPlaylist = (item) => {
    if (!playlist.some((playlistItem) => playlistItem.id === item.id)) {
      setPlaylist((prevPlaylist) => {
        const updatedPlaylist = [...prevPlaylist, item];
        console.log("Playlist after adding:", updatedPlaylist);
        return updatedPlaylist;
      });
    }
  };

  const handleRemoveFromPlaylist = (item) => {
    setPlaylist((prevPlaylist) => {
      const updatedPlaylist = prevPlaylist.filter(
        (playlistItem) => playlistItem.id !== item.id
      );
      console.log("Playlist after removing:", updatedPlaylist);
      return updatedPlaylist;
    });
  };

  const handleSearch = async (query) => {
    if (!query) {
      console.error("Search query is empty.");
      return;
    }
    console.log("Searching Spotify for query:", query);

    try {
      const tracks = await searchSpotify(query, "track"); // Call searchSpotify
      console.log("Fetched tracks:", tracks); // Log search results

      const formattedTracks = tracks.map((track) => ({
        id: track.id,
        trackUri: track.uri,
        imageUrl: track.album.images[0]?.url || "", // Use album image
        title: track.name, // Use track name
        subtitle: track.artists.map((artist) => artist.name).join(", "), // Combine artist names
        album: track.album.name, // Album name
        duration: `${Math.floor(track.duration_ms / 60000)}:${Math.floor(
          (track.duration_ms % 60000) / 1000
        )
          .toString()
          .padStart(2, "0")}`, // Convert duration_ms to minutes:seconds format
      }));

      setSearchResults((prev) => ({
        ...prev,
        tracks: formattedTracks, // Update tracks with the formatted data
      }));
    } catch (error) {
      console.error("Error fetching search results:", error);
      console.log("Formatted tracks object:", formattedTracks);
    }
  };

  const handleLoginClick = () => {
    login();
  };

  const getUserId = async () => {
    const endPoint = "https://api.spotify.com/v1/me";
    try {
      const response = await fetch(endPoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentToken.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();

      const userId = data.id;
      const userName = data.display_name;
      console.log("User id:", userId);
      console.log(`The user's name is ${userName}`);

      return userId;
    } catch (error) {
      console.error(`Error fetching user ID:`, error);
    }
  };
  /* To create a new playlist, you will need to make a POST request to the
   /v1/users/{user_id}/playlists endpoint. You can set the name and description
    of the new playlist in the request body. */

  const createPlaylist = async () => {
    // Validate playlistName
    if (!playlistName.trim()) {
      toast.warn("Playlist name cannot be empty.");
      return;
    }

    // Validate playlist length
    if (playlist.length === 0) {
      toast.warn("Please add some items to your playlist.");
      return;
    }

    try {
      // Get userId
      const userId = await getUserId();
      if (!userId) {
        console.error("Unable to create playlist. User id not available.");
        return;
      }

      // Define playlist details
      const playlistData = {
        name: playlistName, // Use the playlistName from state
        description: "Created with Playlistify!", // Optional description
        public: true, // Optional visibility setting
      };

      // Fetch request to create playlist
      const response = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken.access_token}`, // Pass the token
            "Content-Type": "application/json", // Explicitly define content type
          },
          body: JSON.stringify(playlistData), // Send playlist data
        }
      );

      // Handle non-OK response
      if (!response.ok) {
        console.error("Playlist not created.");
        toast.error("Playlist not created.");
        return null; // Stop execution
      }

      // Parse and return successful response
      const data = await response.json();
      setplaylistId(data.id); // Update the state variable with the current playlist's ID.
      console.log("playlist id:", playlistId);
      console.log("Playlist created successfully:", data);
      toast.success("Playlist successfully created with ID:", playlistId);
      return data.id;
    } catch (error) {
      // Catch any unexpected errors
      console.error("An error occurred while creating the playlist:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  /* To add tracks to the new playlist, you will need to make a POST request to the
   //v1/users/{user_id}/playlists/{playlist_id}/tracks endpoint. 
  // You can provide a list of track IDs in the request body to add them to the playlist. */

  const handleNameChange = (e) => {
    setPlaylistName(e.target.value);
  };

  const handleSavePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.warn("Playlist name cannot be missing");
      return; // Stop execution if playlist name is invalid
    }

    if (playlist.length === 0) {
      toast.warn("Your playlist is empty! Add some tracks first.");
      return; // Stop execution if playlist is empty
    }
    // Map track URIs from the playlist state
    const trackUris = playlist.map((track) => track.trackUri); // Create an array of URIs
    console.log("track uris:", trackUris);
    console.log(playlist);
    try {
      if (playlistId) {
        console.log("Track Uris:", trackUris);
        await addTrackToPlaylist(playlistId, trackUris);
        console.log("track uris:", trackUris);
        toast.success("Playlist saved successfully to your Spotify account!");
        console.log("Playlist saved successfully");
      } else {
        toast.error("Failed to save playlist");
        console.error("Failed to create playlist");
      }
    } catch (error) {
      console.errordata("Error saving playlist:", error);
      toast.error(
        "An error occurred while saving the playlist. Please try again."
      );
    }
  };

  const clearPlaylist = async (playlistId) => {
    if (!playlistId) {
      toast.warn("Playlist ID is missing.");
      return; // return early if playlistId is missing when invoked
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentToken.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tracks: [], // Remove all tracks
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error when attempting to clear playlist", errorData);
        toast.error("Error when trying to clear the playlist.");
      }
    } catch (error) {
      console.error("Error clearing playlist:", error);
      toast.error("An error occurred while clearing the playlist.");
    }
  };

  const handlePlaylistId = async () => {
    const newPlaylistId = await createPlaylist();
    setplaylistId(newPlaylistId);
  };

  const handleClearPlaylist = async () => {
    if (!playlistId) {
      toast.warn("No tracks to be cleared!");
      return;
    }
    await clearPlaylist(playlistId);
    closeModal();
    setPlaylist([]);
    console.log("playlist cleared");
  };
  const [profile, setProfile] = useState(null);
  const endpoint = "https://api.spotify.com/v1/me";
  useEffect(() => {
    if (!currentToken || !currentToken.access_token) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentToken.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to get user profile");

        const data = await response.json();
        setProfile(data);
        console.log("Profile Data", data);
      } catch (error) {
        console.log("Error reason", error);
      }
    };
    fetchProfile();
  }, [currentToken]);

  return (
    <div className="app">
      <TopBar
        onQuery={query}
        onSetQuery={setQuery}
        onHandleSearch={handleSearch}
        onHandleLogin={handleLoginClick}
      ></TopBar>
      <div className="marginAuto">
        <div className="grid">
          <UserProfile userProfile={profile} />
          <ToastContainer />
          <Modal isOpen={modalIsOpen} style={customStyles}>
            <h2>Session Expired</h2>
            <p>Please log in again.</p>
            <button className="login" onClick={handleLoginClick}>
              Login to Spotify
            </button>
          </Modal>
        </div>
      </div>

      <div className="container-res">
        <div className="grid">
          <Panel delay={400} className="panelOne">
            <div className="resultsHeading">
              <h2>Search Results</h2>
            </div>
            <SearchResults
              title="Search Results"
              items={searchResults.tracks}
              onCardClick={handleCardClick}
              onButtonClick={handleAddToPlaylist}
              buttonLabel="Add to Playlist" // Use a string directly
              isPlaylist={false} // Not in the playlist
              playlist={playlist}
            />
          </Panel>
          <Panel delay={600} className="panelTwo">
            <Playlist
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              playlist={playlist}
              playlistName={playlistName}
              onSetPlaylistName={handleNameChange}
              onCreatePlaylist={createPlaylist}
              onSavePlaylist={handleSavePlaylist}
              onClearPlaylist={handleClearPlaylist}
              isPlaylist={true} // In the playlist
            />
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default App;
