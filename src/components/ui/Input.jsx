import PropTypes from "prop-types";

export const Input = ({ placeholder }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="outline-none rounded-xl py-2 px-3 w-2/5"
    />
  );
};

Input.propTypes = {
  placeholder: PropTypes.string.isRequired,
};
