import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const UnfollowersContext = createContext();

export const UnfollowersProvider = ({ children }) => {
  const [unfollowers, setUnfollowers] = useState([]);

  const getUnfollowers = (newUnfollowers) => {
    setUnfollowers(newUnfollowers);
  };

  return (
    <UnfollowersContext.Provider value={{ unfollowers, getUnfollowers }}>
      {children}
    </UnfollowersContext.Provider>
  );
};

export const useUnfollowersContext = () => {
  return useContext(UnfollowersContext);
};

UnfollowersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
