
// src/components/AddressForm.js
import React from 'react';
import './AddressForm.css';

const AddressForm = ({
  value,
  onChangeAddressDetails,
  onChangeCity,
  onChangeState,
  onChangePinCode,
  onSave,     // function to call on submit (parent handles API)
  onCancel,   // cancel handler
  isEditing,  // boolean: true if editing existing address
  saving,     // boolean: whether save is in progress
}) => {
  const { address_details = '', city = '', state = '', pin_code = '' } = value || {};

  return (
    <div className="address-form-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (typeof onSave === 'function') onSave();
        }}
      >
        <h2 className="address-form-title">{isEditing ? 'Edit Address' : 'Add New Address'}</h2>

        <div className="form-group">
          <label className="form-label">
            Address Details
          </label>
          <input
            type="text"
            value={address_details}
            onChange={onChangeAddressDetails}
            className="form-input"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              City
            </label>
            <input type="text" value={city} onChange={onChangeCity} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">
              State
            </label>
            <input type="text" value={state} onChange={onChangeState} className="form-input" required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            PIN Code
          </label>
          <input type="text" value={pin_code} onChange={onChangePinCode} className="form-input" required />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={saving} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Address')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
