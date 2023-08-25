import PropTypes from "prop-types";

export const Button = ({ children }) => {
  return (
    <button className="rounded-xl py-2 px-3 w-1/5 bg-white hover:bg-gray-100 transition">
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
};
