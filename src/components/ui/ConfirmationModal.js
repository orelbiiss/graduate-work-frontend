import React from 'react';
import '../../css/ConfirmationModal.css'; // Стили вынесем отдельно

const ConfirmationModal = ({ show, orderId, currentStatus, newStatus, onCancel, onConfirm, 
                             cancelText, confirmText, title, isAdminPanel = false, address,
                             description, isAddressDelete
}) => {

  if (!show) return null;

  return (
    <>
      <div className="cancelStatusChange" onClick={onCancel}></div>
      <div className="confirmation-modal">
        <div className="modal-content">
            {isAdminPanel ? (
                <>
                    <p className='modal-content-text-bold'>
                        {title} №{orderId}
                    </p>
                    <p className='modal-content-status'>«{currentStatus}» → «{newStatus}»</p>
                </> ) : 
                <p className='modal-content-text-bold'>
                            {title}
                </p>
            }
            {isAddressDelete && (description)}
            <div className="modal-buttons">
                <button className="cancel-button" onClick={onCancel}>{cancelText}</button>
                <button className="confirm-button" onClick={onConfirm}>{confirmText}</button>
            </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;