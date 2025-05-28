import '../../css/Toast.css';

function Toast({ message, type }) {

    const icons = {
        info: '/img/icon-info.svg',
        success: '/img/icon-success.svg',
        error: '/img/icon-error.svg'
      };

  return (
    <div className={`toast ${type}`}>
        <div className="toast-icon">
            <img 
            src={icons[type] || icons[type]} 
            alt={type}
            className="toast-icon"
            />
        </div>
        <div className="toast-message">
            {message}
        </div>
    </div>
  );
}

export default Toast;
