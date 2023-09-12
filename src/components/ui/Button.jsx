import PropTypes from "prop-types";

export const Button = ({ children, onClick }) => {
  return (
    <button
      className="rounded-xl py-2 px-3 w-full max-w-[300px] md:max-w-none md:w-[22%] bg-white hover:bg-gray-100 transition"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
