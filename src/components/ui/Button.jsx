import PropTypes from 'prop-types'

export const Button = ({ children, onClick }) => {
  return (
    <button
      className="rounded-md py-2 px-3 w-full sm:w-1/3 bg-white hover:bg-gray-100 transition max-w-xs sm:max-w-none"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
}
