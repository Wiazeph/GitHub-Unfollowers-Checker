import PropTypes from "prop-types";

export const Input = ({ placeholder, onChange }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      className="outline-none rounded-xl py-2 px-3 w-full max-w-[300px] md:max-w-none md:w-[39%]"
      required
    />
  );
};

Input.propTypes = {
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
