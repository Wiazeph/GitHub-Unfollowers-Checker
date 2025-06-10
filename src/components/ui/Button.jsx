import PropTypes from 'prop-types'

export const Button = ({ children, onClick, disabled = false }) => {
  return (
    <button
      className={`h-full rounded-md py-2 px-3 w-full sm:w-1/3 transition max-w-xs sm:max-w-none ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-white hover:bg-gray-100 text-gray-950'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}
